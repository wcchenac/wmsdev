import { GET_Errors, CREATE_Errors, SHRINK_Errors } from "../actions/types";

const initialState = {};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_Errors:
      return { ...state, errors: action.payload };
    case CREATE_Errors:
      return { ...state, createErrors: action.payload };
    case SHRINK_Errors:
      return { ...state, shrinkErrors: action.payload };
    default:
      return state;
  }
}
