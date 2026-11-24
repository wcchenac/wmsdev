import { toast } from "react-toastify";
import { isDuplicateRequest } from "./requestDedup";

export const REQUEST_FAILED_MESSAGE = "操作失敗，請稍後再試";

const refreshFailureMessages = new WeakMap<object, string>();

/**
 * Marks a thrown refresh-query error after a mutation already succeeded, without mutating
 * properties on the error object itself.
 */
export function markRefreshFailure(error: unknown, message: string): void {
  if (typeof error === "object" && error !== null) {
    refreshFailureMessages.set(error, message);
  }
}

/**
 * Returns true when an error came from the follow-up refresh query of a two-step action whose
 * mutation step already succeeded on the server.
 */
export function isRefreshFailure(error: unknown): boolean {
  return typeof error === "object" && error !== null && refreshFailureMessages.has(error);
}

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
  const status = responseStatus(error);
  if (status === undefined || status < 400 || status >= 500) return undefined;
  const data = responseData(error);
  if (typeof data !== "object" || data === null || !("message" in data)) return undefined;
  if (isSpringDefaultErrorBody(data)) return undefined;
  const message = data.message;
  return typeof message === "string" && message.trim() !== "" ? message.trim() : undefined;
}

/** The HTTP status of a failed request, or undefined (no response, or a non-number status). */
export function responseStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = error.response;
  if (typeof response !== "object" || response === null || !("status" in response)) return undefined;
  return typeof response.status === "number" ? response.status : undefined;
}

/** The body of a failed request's response, or undefined (no response, or no body). */
function responseData(error: unknown): unknown {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = error.response;
  if (typeof response !== "object" || response === null || !("data" in response)) return undefined;
  return response.data;
}

/**
 * True for a 401: API.ts then shows 「登入已逾時，請重新登入」 and goes to /login (with or
 * without a stored token), so callers with their own failure toast should skip it. The login
 * request's own 401 (wrong password) is shown by the login form, which does not use this.
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
  // API.ts already tells the user the session expired and sends them to /login,
  // and silently blocks concurrent duplicate write submissions.
  if (isSessionExpired(error) || isDuplicateRequest(error)) {
    return;
  }
  if (typeof error === "object" && error !== null) {
    const refreshMessage = refreshFailureMessages.get(error);
    if (refreshMessage !== undefined) {
      toast.error(refreshMessage);
      return;
    }
  }
  toast.error(clientErrorMessage(error) ?? REQUEST_FAILED_MESSAGE);
}
