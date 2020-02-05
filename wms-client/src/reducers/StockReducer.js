import {
  GET_Order,
  GET_StockInfo,
  GET_StockInfoes,
  SHIP_Stock,
  SHRINK_Stock,
  CANCEL_SHRINK,
  UPDATE_StockInfo
} from "../actions/types";

const initialState = {
  stockInfoes: [],
  stockInfo: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_Order:
    case GET_StockInfoes:
    case SHRINK_Stock:
    case UPDATE_StockInfo:
      return {
        ...state,
        stockInfoes: action.payload
      };
    case GET_StockInfo:
      return {
        ...state,
        stockInfo: action.payload
      };
    case SHIP_Stock:
      return {
        ...state,
        stockInfoes: {
          ...state.stockInfoes,
          result: state.stockInfoes.result.filter(
            stockInfo => stockInfo.stockIdentifier.id !== action.payload
          )
        }
      };
    case CANCEL_SHRINK:
      return {
        ...state,
        stockInfoes: state.stockInfoes.filter(
          stockInfo => stockInfo.stockIdentifier.id !== action.payload
        )
      };
    default:
      return state;
  }
}
