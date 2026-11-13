import { AxiosResponse } from "axios";
import API from "../utilities/API";
import { GET_StockInfoes, AppDispatch } from "../types";

export const downloadFile = (
  fileCategory: string,
  filename: string
): void => {
  API.get(`api/file/download/${fileCategory}/${filename}`, {
    responseType: "blob",
  })
    .then((response) => {
      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: String(response.headers["content-type"] ?? ""),
        })
      );
      const link = document.createElement("a");
      link.href = url;
      const contentDisposition = response.headers["content-disposition"];
      link.setAttribute(
        "download",
        contentDisposition ? contentDisposition.split("filename=")[1] : filename
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch(() => {
      // Error handled by global interceptor in API.js
      // Additional UI feedback can be added here if needed
    });
};

export const queryFileCategoryTodayFile = async (
  fileCategory: string
): Promise<AxiosResponse> => {
  return await API.get(`/api/file/query/${fileCategory}/today`);
};

export const queryFileCategoryIntervalFiles = async (
  fileCategory: string,
  startDate: string,
  endDate: string
): Promise<AxiosResponse> => {
  return await API.get(
    `/api/file/query/${fileCategory}/interval?startDate=${startDate}&endDate=${endDate}`
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
        type: GET_StockInfoes,
        payload: res.data,
      });

      return res;
    } catch (err) {
      // Error handled by global interceptor in API.js
      throw err;
    }
  };
