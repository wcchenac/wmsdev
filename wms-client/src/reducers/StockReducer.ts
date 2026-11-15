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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object";
};

const isStockRow = (value: unknown): value is StockInfo => {
  return isRecord(value) && "stockIdentifier" in value;
};

const quantityAfterShip = (
  current: unknown,
  shippedQty: number
): number | string => {
  const next = Math.round((Number(current) - shippedQty) * 100) / 100;
  if (typeof current === "string") {
    return Number.isInteger(next) ? String(next) : next.toFixed(2);
  }
  return next;
};

/**
 * result loses the shipped row. productList is either those same rows or the
 * per-type quantity totals built from them, and either way it has to follow
 * result or the totals still include the stock that just left.
 */
const productListAfterShip = (
  productList: unknown[],
  shipped: StockInfo | undefined
): unknown[] => {
  const shippedId = shipped?.stockIdentifier?.id;
  if (productList.some(isStockRow)) {
    return productList.filter((item) => {
      if (!isStockRow(item)) {
        return true;
      }
      return item.stockIdentifier?.id !== shippedId;
    });
  }

  const type = shipped?.stockIdentifier?.type;
  const shippedQty = Number(shipped?.stockIdentifier?.quantity);
  if (!type || !Number.isFinite(shippedQty)) {
    return productList;
  }

  let applied = false;
  return productList.map((item) => {
    if (applied || !isRecord(item) || item.type !== type) {
      return item;
    }
    if (!Number.isFinite(Number(item.quantity))) {
      return item;
    }
    applied = true;
    return { ...item, quantity: quantityAfterShip(item.quantity, shippedQty) };
  });
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
        const shippedId = action.payload as number;
        const shipped = state.stockInfoes.result.find(
          (stockInfo) => stockInfo.stockIdentifier?.id === shippedId
        );
        const stockInfoes: StockInfoesWithResult = {
          ...state.stockInfoes,
          result: state.stockInfoes.result.filter(
            (stockInfo) => stockInfo.stockIdentifier?.id !== shippedId
          )
        };
        if (Array.isArray(state.stockInfoes.productList)) {
          stockInfoes.productList = productListAfterShip(
            state.stockInfoes.productList,
            shipped
          );
        }
        return {
          ...state,
          stockInfoes
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
