import { CREATE_FILE } from "../actions/types";

const initialState = {};

function fileReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_FILE:
      return state;
    default:
      return state;
  }
}

export default fileReducer;
