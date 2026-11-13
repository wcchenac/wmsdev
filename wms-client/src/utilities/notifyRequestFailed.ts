import { toast } from "react-toastify";

export const REQUEST_FAILED_MESSAGE = "操作失敗，請稍後再試";

/**
 * Spring's own error body ({ timestamp, status, error, message, path }), whose message is for
 * developers ("Access Denied", "No message available", "Required request body is missing").
 */
function isSpringDefaultErrorBody(data: object): boolean {
  return "timestamp" in data && ("path" in data || "error" in data);
}

/**
 * The backend's `message`, trimmed, when the response is a 4xx with a non-empty one that the
 * app itself wrote (not Spring's default error body).
 */
function clientErrorMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = error.response;
  if (typeof response !== "object" || response === null) return undefined;
  const status = "status" in response ? response.status : undefined;
  if (typeof status !== "number" || status < 400 || status >= 500) return undefined;
  const data = "data" in response ? response.data : undefined;
  if (typeof data !== "object" || data === null || !("message" in data)) return undefined;
  if (isSpringDefaultErrorBody(data)) return undefined;
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
 * True for a 401: API.ts then shows 「登入已逾時，請重新登入」 and goes to /login, so callers
 * with their own failure toast should skip it.
 */
export function isSessionExpired(error: unknown): boolean {
  return responseStatus(error) === 401;
}

/**
 * Shows a toast for a failed API call. The actions dispatch the error to the store and then
 * rethrow it; call sites use this in their .catch so the failure is visible instead of an
 * unhandled rejection.
 *
 * The backend's own message is shown only for a 4xx answer with a non-empty message the app
 * wrote (a request the user can correct). Server errors, Spring's default error bodies (also
 * on a 4xx: "Access Denied", "No message available"), empty messages and network failures get
 * REQUEST_FAILED_MESSAGE.
 */
export function notifyRequestFailed(error: unknown): void {
  // API.ts already tells the user the session expired and sends them to /login.
  if (isSessionExpired(error)) {
    return;
  }
  toast.error(clientErrorMessage(error) ?? REQUEST_FAILED_MESSAGE);
}
