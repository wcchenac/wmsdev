import { combineReducers } from "redux";
import errorReducer from "./erorrReducer";
import ClothInfoReducer from "./ClothInfoReducer";
import FileReducer from "./FileReducer";

export default combineReducers({
  errors: errorReducer,
  clothInfo: ClothInfoReducer,
  filename: FileReducer
});
