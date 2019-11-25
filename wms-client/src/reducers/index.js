import { combineReducers } from "redux";
import ErrorReducer from "./ErorrReducer";
import ClothInfoReducer from "./ClothInfoReducer";
import FileReducer from "./FileReducer";
import OutStockRequestReducer from "./OutStockRequestReducer";

export default combineReducers({
  errors: ErrorReducer,
  clothInfo: ClothInfoReducer,
  fileName: FileReducer,
  outStockRequests: OutStockRequestReducer
});
