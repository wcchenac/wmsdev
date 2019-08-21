import { combineReducers } from "redux";
import errorReducer from "./erorrReducer";
import ClothInfoReducer from "./ClothInfoReducer";

export default combineReducers({
  errors: errorReducer,
  clothInfo: ClothInfoReducer
});
