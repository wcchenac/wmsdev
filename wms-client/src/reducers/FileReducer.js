import { CREATE_FILE } from "../actions/types";

const initialState = {};

export default function(state = initialState, action) {
  switch (action.type) {
    case CREATE_FILE:
      return action.payload;
    default:
      return state;
  }
}
