import { AxiosResponse } from "axios";
import API from "../utilities/API";
import { notifyRequestFailed } from "../utilities/notifyRequestFailed";
import { GET_Categories, AppDispatch } from "../types";

/**
 * Extracts a safe filename from an HTTP `Content-Disposition` header, supporting both
 * RFC 5987 (`filename*=UTF-8''...`) and quoted/unquoted `filename=...` parameters.
 */
function parseDownloadFilename(contentDisposition: unknown, fallback: string): string {
  if (typeof contentDisposition !== "string" || contentDisposition.trim() === "") {
    return fallback;
  }

  const extMatch = /filename\*\s*=\s*(?:[^']*'[^']*')?([^;\r\n]+)/i.exec(contentDisposition);
  if (extMatch?.[1]) {
    const raw = extMatch[1].trim().replace(/^"(.*)"$/, "$1");
    try {
      const decoded = decodeURIComponent(raw).trim();
      if (decoded) return decoded;
    } catch {
      if (raw) return raw;
    }
  }

  const basicMatch = /filename\s*=\s*"([^"]+)"|filename\s*=\s*([^;\r\n]+)/i.exec(contentDisposition);
  const resolved = (basicMatch?.[1] ?? basicMatch?.[2] ?? "").trim();
  return resolved || fallback;
}

/**
 * When a `responseType: "blob"` request fails with a JSON error payload inside a Blob,
 * decode it into a structured `response.data` object so `notifyRequestFailed` can inspect it.
 */
async function unwrapBlobError(error: unknown): Promise<unknown> {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return error;
  }

  const response = (error as { response?: { data?: unknown } }).response;
  if (!response || typeof response !== "object" || !(response.data instanceof Blob)) {
    return error;
  }

  try {
    const text = (await response.data.text()).trim();
    if (!text) return error;
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { message: text };
    }
    return {
      ...error,
      response: {
        ...response,
        data: parsed,
      },
    };
  } catch {
    return error;
  }
}

const inFlightDownloads = new Set<string>();

export const downloadFile = async (
  fileCategory: string,
  filename: string
): Promise<void> => {
  const downloadKey = `${fileCategory}\0${filename}`;
  if (inFlightDownloads.has(downloadKey)) {
    return;
  }
  inFlightDownloads.add(downloadKey);
  try {
    const response = await API.get(
      `api/file/download/${encodeURIComponent(fileCategory)}/${encodeURIComponent(filename)}`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data], {
        type: String(response.headers["content-type"] ?? ""),
      })
    );
    try {
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        parseDownloadFilename(response.headers["content-disposition"], filename)
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      window.URL.revokeObjectURL(url);
    }
  } catch (error: unknown) {
    // 401 is toasted and redirected by the interceptor in API.ts.
    const resolvedError = await unwrapBlobError(error);
    notifyRequestFailed(resolvedError);
  } finally {
    inFlightDownloads.delete(downloadKey);
  }
};

export const queryFileCategoryTodayFile = async (
  fileCategory: string
): Promise<AxiosResponse> => {
  return await API.get(`/api/file/query/${encodeURIComponent(fileCategory)}/today`);
};

export const queryFileCategoryIntervalFiles = async (
  fileCategory: string,
  startDate: string,
  endDate: string
): Promise<AxiosResponse> => {
  return await API.get(
    `/api/file/query/${encodeURIComponent(fileCategory)}/interval?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  );
};

export const inStockByImportFile = async (
  files: FormData
): Promise<AxiosResponse> => {
  return await API.post("api/file/import/inStockFile", files);
};

export const setWHByImportFile = async (
  files: FormData
): Promise<AxiosResponse> => {
  return await API.post("api/file/import/setWHFile", files);
};

export const queryCategoryDetailList =
  () =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get("api/file/query/categoryList");

      dispatch({
        type: GET_Categories,
        payload: res.data,
      });

      return res;
    } catch (err) {
      // Error handled by global interceptor in API.js
      throw err;
    }
  };
