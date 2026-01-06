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

type FileAction = Action<void>;

export default function FileReducer(
  state: FileState = initialState,
  action: FileAction
): FileState {
  switch (action.type) {
    case CREATE_FILE:
      return {
        ...state,
        isLoading: true,
        lastOperation: "create"
      };
    default:
      return state;
  }
}
