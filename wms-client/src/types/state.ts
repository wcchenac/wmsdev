import type {
  HandleListResponse,
  ManagedUser,
  OrderQueryPayload,
  ProductQueryPayload,
  SessionUser,
  StoredStockInfo,
} from "./domain";

export interface ErrorState {
  errors?: Record<string, string>;
  createErrors?: Record<string, string>;
  shrinkErrors?: Record<string, string>;
}

/**
 * stockInfoes holds whichever payload the latest stock action stored:
 * an order query, a product query, a stock list, or an empty initial value.
 */
export type StockInfoesState =
  | OrderQueryPayload
  | ProductQueryPayload
  | StoredStockInfo[]
  | HandleListResponse
  | Record<string, never>;

export interface StockState {
  stockInfoes: StockInfoesState;
  stockInfo: StoredStockInfo | Record<string, never>;
}

export interface UserState {
  validToken: boolean;
  user: SessionUser;
  users: ManagedUser[];
}

export interface OutStockRequestState {
  outStockRequests: HandleListResponse | Record<string, never>;
}

export interface RootState {
  errors: ErrorState;
  stockInfo: StockState;
  fileName: Record<string, never>;
  outStockRequests: OutStockRequestState;
  user: UserState;
}
