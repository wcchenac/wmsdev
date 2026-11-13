import { toast } from "react-toastify";

export const REQUEST_FAILED_MESSAGE = "操作失敗，請稍後再試";

/** The backend's `message`, trimmed, when the response is a 4xx with a non-empty one. */
function clientErrorMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = error.response;
  if (typeof response !== "object" || response === null) return undefined;
  const status = "status" in response ? response.status : undefined;
  if (typeof status !== "number" || status < 400 || status >= 500) return undefined;
  const data = "data" in response ? response.data : undefined;
  if (typeof data !== "object" || data === null || !("message" in data)) return undefined;
  const message = data.message;
  return typeof message === "string" && message.trim() !== "" ? message.trim() : undefined;
}

function responseStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = error.response;
  if (typeof response !== "object" || response === null || !("status" in response)) return undefined;
  return typeof response.status === "number" ? response.status : undefined;
}

/**
 * Shows a toast for a failed API call. The actions dispatch the error to the store and then
 * rethrow it; call sites use this in their .catch so the failure is visible instead of an
 * unhandled rejection.
 *
 * The backend's own message is shown only for a 4xx answer with a non-empty message (a request
 * the user can correct). Server errors and Spring's default bodies ("No message available",
 * SQL text), empty messages and network failures get REQUEST_FAILED_MESSAGE.
 */
export function notifyRequestFailed(error: unknown): void {
  // API.ts already tells the user the session expired and sends them to /login.
  if (responseStatus(error) === 401) {
    return;
  }
  toast.error(clientErrorMessage(error) ?? REQUEST_FAILED_MESSAGE);
}
