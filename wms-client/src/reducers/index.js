import { combineReducers } from "redux";
import ErrorReducer from "./ErorrReducer";
import StockReducer from "./StockReducer";
import FileReducer from "./FileReducer";
import OutStockRequestReducer from "./OutStockRequestReducer";
import UserReducer from "./UserReducer";

export default combineReducers({
  errors: ErrorReducer,
  stockInfo: StockReducer,
  fileName: FileReducer,
  outStockRequests: OutStockRequestReducer,
  user: UserReducer
});
