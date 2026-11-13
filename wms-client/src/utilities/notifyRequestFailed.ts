import { toast } from "react-toastify";

export const REQUEST_FAILED_MESSAGE = "操作失敗，請稍後再試";

/**
 * Shows a toast for a failed API call. The actions dispatch the error to the store and then
 * rethrow it; call sites use this in their .catch so the failure is visible instead of an
 * unhandled rejection. Uses the backend's `message` when it sends one.
 */
export function notifyRequestFailed(error: unknown): void {
  const data = (error as { response?: { data?: unknown } } | null)?.response?.data;
  const message =
    data && typeof data === "object" && typeof (data as { message?: unknown }).message === "string"
      ? (data as { message: string }).message
      : REQUEST_FAILED_MESSAGE;
  toast.error(message);
}
