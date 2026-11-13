import {
  GET_Errors,
  CREATE_Errors,
  SHRINK_Errors,
  ErrorState,
  Action
} from "../types";

/**
 * ErrorReducer - Manages API error states
 * Stores different types of errors from various operations
 */
const initialState: ErrorState = {
  errors: null,
  createErrors: null,
  shrinkErrors: null
};

type ErrorPayload = Record<string, string> | null;
type ErrorAction = Action<ErrorPayload>;

export default function ErrorReducer(
  state: ErrorState = initialState,
  action: ErrorAction
): ErrorState {
  switch (action.type) {
    case GET_Errors:
      return { ...state, errors: action.payload ?? null };
    case CREATE_Errors:
      return { ...state, createErrors: action.payload ?? null };
    case SHRINK_Errors:
      return { ...state, shrinkErrors: action.payload ?? null };
    default:
      return state;
  }
}
