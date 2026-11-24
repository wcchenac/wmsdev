import { AppDispatch, GET_Errors, UPDATE_Errors } from "../types";
import { markRefreshFailure } from "./notifyRequestFailed";
import { isDuplicateRequest } from "./requestDedup";

interface MutateThenRefreshOptions<M, R> {
  dispatch: AppDispatch;
  errorType: typeof GET_Errors | typeof UPDATE_Errors;
  mutate: () => Promise<M>;
  mutateErrorMessage: string;
  refresh: (mutateResult: M) => Promise<R>;
  refreshErrorMessage: string;
}

/**
 * Runs a two-step mutation followed by a state-refreshing query with separate error handling.
 * If the mutation itself fails, stores its backend error (or `mutateErrorMessage`). If the
 * mutation succeeded and only the refresh fails, stores and tags `refreshErrorMessage` so callers
 * know the write already landed on the server and will not prompt the user to resubmit.
 */
export async function mutateThenRefresh<M, R>({
  dispatch,
  errorType,
  mutate,
  mutateErrorMessage,
  refresh,
  refreshErrorMessage,
}: MutateThenRefreshOptions<M, R>): Promise<R> {
  let mutateResult: M;
  try {
    mutateResult = await mutate();
  } catch (err) {
    if (isDuplicateRequest(err)) {
      throw err;
    }
    const error = err as { response?: { data?: unknown } };
    dispatch({
      type: errorType,
      payload: error.response?.data || { message: mutateErrorMessage },
    });
    throw err;
  }

  try {
    return await refresh(mutateResult);
  } catch (err) {
    markRefreshFailure(err, refreshErrorMessage);
    dispatch({
      type: errorType,
      payload: { message: refreshErrorMessage },
    });
    throw err;
  }
}
