// ============================================
// Action Types
// ============================================
export const GET_Errors = "GET_Errors";
export const CREATE_Errors = "CREATE_Errors";
export const SHRINK_Errors = "SHRINK_Errors";
export const UPDATE_Errors = "UPDATE_Errors";
export const GET_Order = "GET_Order";
export const GET_StockInfo = "GET_StockInfo";
export const GET_StockInfoes = "GET_StockInfoes";
export const UPDATE_StockInfo = "UPDATE_StockInfo";
export const DELETE_Stock = "DELETE_Stock";
export const SHIP_Stock = "SHIP_Stock";
export const SHIP_Stocks = "SHIP_Stocks";
export const CREATE_FILE = "CREATE_FILE";
export const SHRINK_Stock = "SHRINK_Stock";
export const CANCEL_SHRINK = "CANCEL_SHRINK";
export const GET_OutStockRequests = "GET_OutStockRequests";
export const SET_Current_User = "SET_Current_User";
export const GET_UserList = "GET_UserList";
export const DELETE_User = "DELETE_User";
export const UPDATE_User = "UPDATE_User";

// ============================================
// User Types
// ============================================
export interface RoleObject {
  authority?: string;
}

export interface User {
  employeeId?: string;
  username?: string;
  fullName?: string;
  role?: string | RoleObject;
  iat?: number;
  exp?: number;
}

export interface UserState {
  validToken: boolean;
  user: User;
  users: User[];
}

// ============================================
// Stock Types
// ============================================
export interface StockIdentifier {
  id?: number;
  productNo?: string;
  lotNo?: string;
  type?: string;
  quantity?: number;
  unit?: string;
  exist?: boolean;
  eliminateDate?: string;
  waitToShrink?: boolean;
  firstInStockAt?: string;
}

export interface StockInfo {
  id?: number;
  stockIdentifier?: StockIdentifier;
  color?: string;
  defect?: string | DefectOption[];
  shrinkAt?: string;
  remark?: string;
  record?: string;
  warehouse?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockInfoesWithResult {
  result: StockInfo[];
  [key: string]: unknown;
}

export interface StockState {
  stockInfoes: StockInfo[] | StockInfoesWithResult;
  stockInfo: StockInfo;
}

// ============================================
// Out Stock Request Types
// ============================================
export interface OutStockRequest {
  id?: number;
  stockIdentifier?: StockIdentifier;
  requestUser?: string;
  requestQuantity?: number;
  requestDate?: string;
  status?: string;
}

export interface OutStockRequestState {
  outStockRequests?: {
    queryResult?: Record<string, unknown>;
    userList?: string[];
  };
}

// ============================================
// File Types
// ============================================
export interface FileState {
  isLoading: boolean;
  lastOperation: string | null;
}

// ============================================
// Error Types
// ============================================
export interface ErrorState {
  errors: Record<string, string> | null;
  createErrors: Record<string, string> | null;
  shrinkErrors: Record<string, string> | null;
}

// ============================================
// Redux Types
// ============================================
export interface RootState {
  user: UserState;
  stockInfo: StockState;
  outStockRequests: OutStockRequestState;
  files: FileState;
  errors: ErrorState;
}

export interface Action<T = unknown> {
  type: string;
  payload?: T;
}

// ============================================
// Component Prop Types
// ============================================
export interface SelectOption {
  value: string;
  label: string;
}

export interface DefectOption {
  value: string;
  label: string;
}

export interface SelectedProductNo {
  productNo: string;
  selected: boolean;
  index: number;
  isSubmitted: boolean;
}

export interface SelectedUser {
  user: string;
  selected: boolean;
  index: number;
}

// ============================================
// API Types
// ============================================
export interface ApiResponse<T = unknown> {
  status: number;
  data?: T;
}

export interface LoginRequest {
  employeeId: string;
  password: string;
}

export interface RegisterUserRequest {
  employeeId: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: string;
}

export interface UpdateUserRequest {
  employeeId: string;
  fullName?: string;
  role?: string;
  [key: string]: unknown;
}

export interface ShipRequest {
  stockIdentifierId: number;
  [key: string]: unknown;
}

export interface ShrinkStockInStockRequest {
  productNo: string;
  lotNo: string;
  type?: string;
  quantity: string;
  unit: string;
  color: string;
  defect: string | DefectOption[];
  record: string;
  remark: string;
  inStockType: string;
  directShip: boolean;
  outStockReason: string;
  parentId: number;
  errors?: {
    quantity: string;
  };
}

export interface ShrinkStockRequest {
  oldStockIdentifierId: number;
  inStockRequests: ShrinkStockInStockRequest[];
  allocation: number;
  adjustment: number;
  shrinkType: string;
}

export interface OutStockRequestCreate {
  stockIdentifierId: number;
  requestQuantity: number;
  [key: string]: unknown;
}

export interface UpdateStockInfoRequest {
  stockIdentifierId: number;
  [key: string]: unknown;
}

export interface InStockRequest {
  productNo?: string;
  lotNo?: string;
  type?: string;
  quantity?: number;
  unit?: string;
  color?: string;
  defect?: string;
  remark?: string;
  record?: string;
  warehouse?: string;
  location?: string;
}

export interface OutStockUpdateRequest {
  id?: number;
  status?: string;
  [key: string]: unknown;
}

export interface ProductHistoryRequest {
  productNo: string;
  startDate: string;
  endDate: string;
}

// ============================================
// Tree Data Types
// ============================================
export interface TreeNode {
  id: string;
  stockInfo: StockInfo;
  children: TreeNode[];
}

export interface ShrinkRollbackNode {
  stockInfo: StockInfo;
}

export interface ShrinkRollbackObject {
  stockInfo: StockInfo;
  nodes: ShrinkRollbackNode[];
}

// ============================================
// InStock Rollback Types
// ============================================
export interface InStockRollbackResult {
  [productNo: string]: StockInfo[];
}

// ============================================
// Form Types
// ============================================
export interface TouchedFields {
  [key: string]: boolean;
}

// ============================================
// Dispatch Type
// ============================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ThunkAction<R = any> = (dispatch: AppDispatch) => R;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppDispatch = (action: Action | ThunkAction<any>) => any;
