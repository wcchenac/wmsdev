import { combineReducers } from "redux";
import ErrorReducer from "./ErrorReducer";
import StockReducer from "./StockReducer";
import FileReducer from "./FileReducer";
import OutStockRequestReducer from "./OutStockRequestReducer";
import UserReducer from "./UserReducer";

const rootReducer = combineReducers({
  errors: ErrorReducer,
  stockInfo: StockReducer,
  fileName: FileReducer,
  outStockRequests: OutStockRequestReducer,
  user: UserReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
