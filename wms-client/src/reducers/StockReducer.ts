import {
  GET_Order,
  GET_StockInfo,
  GET_StockInfoes,
  SHIP_Stock,
  SHIP_Stocks,
  SHRINK_Stock,
  CANCEL_SHRINK,
  UPDATE_StockInfo,
  StockState,
  StockInfo,
  StockInfoesWithResult,
  Action
} from "../types";

const initialState: StockState = {
  stockInfoes: [],
  stockInfo: {}
};

type StockAction =
  | Action<StockInfo[] | StockInfoesWithResult>
  | Action<StockInfo>
  | Action<number>;

/**
 * Type guard to check if stockInfoes has a result property
 */
const hasResultProperty = (
  stockInfoes: StockInfo[] | StockInfoesWithResult
): stockInfoes is StockInfoesWithResult => {
  return (
    stockInfoes !== null &&
    typeof stockInfoes === "object" &&
    !Array.isArray(stockInfoes) &&
    "result" in stockInfoes
  );
};

export default function StockReducer(
  state: StockState = initialState,
  action: StockAction
): StockState {
  switch (action.type) {
    case GET_Order:
    case GET_StockInfoes:
    case SHIP_Stocks:
    case SHRINK_Stock:
    case UPDATE_StockInfo:
      return {
        ...state,
        stockInfoes: (action.payload as StockInfo[] | StockInfoesWithResult) || []
      };
    case GET_StockInfo:
      return {
        ...state,
        stockInfo: (action.payload as StockInfo) || {}
      };
    case SHIP_Stock: {
      if (hasResultProperty(state.stockInfoes)) {
        return {
          ...state,
          stockInfoes: {
            ...state.stockInfoes,
            result: state.stockInfoes.result.filter(
              (stockInfo) =>
                stockInfo.stockIdentifier?.id !== (action.payload as number)
            )
          }
        };
      }
      return state;
    }
    case CANCEL_SHRINK: {
      if (Array.isArray(state.stockInfoes)) {
        return {
          ...state,
          stockInfoes: state.stockInfoes.filter(
            (stockInfo) =>
              stockInfo.stockIdentifier?.id !== (action.payload as number)
          )
        };
      }
      return state;
    }
    default:
      return state;
  }
}
