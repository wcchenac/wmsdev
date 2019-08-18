import { combineReducers } from "redux";
import errorReducer from "./erorrReducer";

export default combineReducers({
  errors: errorReducer
});
