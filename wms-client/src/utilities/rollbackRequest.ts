import { toast } from "react-toastify";
import { isSessionExpired, notifyRequestFailed } from "./notifyRequestFailed";

// The backend rolls back all or nothing. When any id in the request is gone, or the roll was
// never shrunk, it answers 400 with no body and changes nothing, so the message has to come
// from here and the list on screen is stale.

export const ROLLBACK_REJECTED_MESSAGE = "回朔失敗，沒有任何變更。清單可能已過期，已重新整理。";
export const ROLLBACK_REJECTED_NOT_REFRESHED_MESSAGE =
  "回朔失敗，沒有任何變更。重新整理清單也失敗，請稍後重新查詢。";
/**
 * Any other failure (a 5xx, a gateway timeout, another 4xx, no answer at all): the rollback may
 * or may not have gone through.
 */
export const ROLLBACK_UNCONFIRMED_MESSAGE = "無法確認回朔結果，已重新整理清單，請以畫面為準。";
export const ROLLBACK_UNCONFIRMED_NOT_REFRESHED_MESSAGE = "無法確認回朔結果，請稍後重新查詢。";
export const ROLLBACK_DONE_NOT_REFRESHED_MESSAGE = "回朔完成，但重新整理清單失敗，請重新查詢。";

/** A rollback that did not end with a successful rollback and a fresh list. */
export class RollbackError extends Error {
  /** The failed request: the rollback itself, or the list query after a successful one. */
  readonly requestError: unknown;

  constructor(message: string, requestError: unknown) {
    super(message);
    this.name = "RollbackError";
    this.requestError = requestError;
  }
}

/** The backend's all-or-nothing 400: the rollback was refused and nothing changed. */
function isRejected(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("response" in error)) return false;
  const response = error.response;
  return typeof response === "object" && response !== null && "status" in response && response.status === 400;
}

/**
 * Sends the rollback, then queries the list again whether it went through or not, so the page
 * shows the real data. Resolves with the list response when both succeed; otherwise rejects
 * with a RollbackError saying what happened. A 401 is passed on as is (API.ts shows the
 * session-expired message), without querying the list.
 */
export async function rollbackThenQueryList<T>(
  rollback: () => Promise<unknown>,
  queryList: () => Promise<T>
): Promise<T> {
  let rollbackError: unknown;
  let rolledBack = false;
  try {
    await rollback();
    rolledBack = true;
  } catch (error) {
    if (isSessionExpired(error)) throw error;
    rollbackError = error;
  }

  let list: T;
  try {
    list = await queryList();
  } catch (listError) {
    if (isSessionExpired(listError)) throw listError;
    if (rolledBack) throw new RollbackError(ROLLBACK_DONE_NOT_REFRESHED_MESSAGE, listError);
    throw new RollbackError(
      isRejected(rollbackError) ? ROLLBACK_REJECTED_NOT_REFRESHED_MESSAGE : ROLLBACK_UNCONFIRMED_NOT_REFRESHED_MESSAGE,
      rollbackError
    );
  }

  if (!rolledBack) {
    throw new RollbackError(
      isRejected(rollbackError) ? ROLLBACK_REJECTED_MESSAGE : ROLLBACK_UNCONFIRMED_MESSAGE,
      rollbackError
    );
  }
  return list;
}

/** For a page's .catch after a rollback: the RollbackError's message, else the usual handling. */
export function notifyRollbackFailed(error: unknown): void {
  if (error instanceof RollbackError) {
    toast.error(error.message);
    return;
  }
  notifyRequestFailed(error);
}
