import { GET_Errors } from "../actions/types";

const initialState = {};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_Errors:
      return action.payload;
    default:
      return state;
  }
}
