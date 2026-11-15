import { CREATE_FILE, FileState, Action } from "../types";

/**
 * FileReducer - Manages file operation states
 * Currently tracks loading state for file operations
 * Can be extended to track file names, download status, etc.
 */
const initialState: FileState = {
  isLoading: false,
  lastOperation: null
};

type FileAction = Action<boolean>;

export default function FileReducer(
  state: FileState = initialState,
  action: FileAction
): FileState {
  switch (action.type) {
    case CREATE_FILE:
      return {
        ...state,
        // No payload starts the request. payload false is the reset dispatched
        // once the request has settled, so isLoading cannot stay true.
        isLoading: action.payload !== false,
        lastOperation: "create"
      };
    default:
      return state;
  }
}
