import { SET_Current_User } from "../actions/types";

const initialState = {
  validToken: false,
  user: {}
};

const booleanActionPayload = payload => {
  if (payload) {
    return true;
  } else {
    return false;
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_Current_User:
      return {
        ...state,
        validToken: booleanActionPayload(action.payload),
        user: action.payload
      };
    default:
      return state;
  }
}
