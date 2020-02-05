import {
  SET_Current_User,
  GET_UserList,
  UPDATE_User,
  DELETE_User
} from "../actions/types";

const initialState = {
  validToken: false,
  user: {},
  users: []
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
    case GET_UserList:
    case UPDATE_User:
      return {
        ...state,
        users: action.payload
      };
    case DELETE_User:
      return {
        ...state,
        users: state.users.filter(user => user.employeeId !== action.payload)
      };
    default:
      return state;
  }
}
