import {
  SET_Current_User,
  GET_UserList,
  UPDATE_User,
  DELETE_User,
  User,
  UserState,
  Action
} from "../types";

const initialState: UserState = {
  validToken: false,
  user: {},
  users: []
};

/**
 * Check if payload has valid content (used for token validation)
 */
const hasValidPayload = (payload: User | undefined): boolean =>
  Boolean(payload && Object.keys(payload).length > 0);

type UserAction =
  | Action<User>
  | Action<User[]>
  | Action<string>;

export default function UserReducer(
  state: UserState = initialState,
  action: UserAction
): UserState {
  switch (action.type) {
    case SET_Current_User:
      return {
        ...state,
        validToken: hasValidPayload(action.payload as User),
        user: (action.payload as User) || {}
      };
    case GET_UserList:
    case UPDATE_User:
      return {
        ...state,
        users: (action.payload as User[]) || []
      };
    case DELETE_User:
      return {
        ...state,
        users: state.users.filter(
          (user) => user.employeeId !== (action.payload as string)
        )
      };
    default:
      return state;
  }
}
