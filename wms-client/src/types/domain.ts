/** Shared UI and API shapes used by the warehouse client components. */

export interface DefectOption {
  label: string;
  value: string;
}

export interface QuantityUnit {
  quantity: string;
  unit: string;
}

/** waitHandleStatus / currentStatus keyed by stock type, then quantity and unit. */
export type StatusByType = Record<string, QuantityUnit>;

/** Order status keyed by product number. */
export type StatusByProduct = Record<string, StatusByType>;

export interface OrderQueryPayload {
  currentStatus?: StatusByProduct;
  waitHandleStatus?: StatusByProduct;
}

export interface StockIdentifier {
  id: number;
  productNo: string;
  lotNo: string;
  type: string;
  quantity: string;
  unit: string;
  serialNo?: number;
  exist?: boolean;
  waitToShrink?: boolean;
  inStockType?: string;
  eliminateType?: string;
  eliminateDate?: string;
  eliminateReason?: string;
  adjustment?: string;
  outStock?: boolean;
  isOutStock?: boolean;
  firstInStockAt?: string;
}

/** Stock row returned by the warehouse API. */
export interface StoredStockInfo {
  id?: number;
  stockIdentifier: StockIdentifier;
  color: number | string;
  defect: string;
  record: string;
  remark: string;
  shrinkAt?: string;
  storedAt?: string;
}

export interface ProductInformation {
  productNo: string | null;
  cName?: string;
  spec?: string;
  supp?: string;
  suppName?: string;
  prodDesc?: string;
  userField1?: string;
  descrip?: string;
  packDesc?: string;
  addType?: string;
  picture?: string;
  cCost?: string;
  cCCCODE?: string;
  eNAME?: string;
  eSPEC?: string;
}

export interface ProductQuantity {
  productNo?: string;
  type?: string;
  category?: string;
  quantity?: string;
  unit?: string;
  safeQuantity?: string;
  cName?: string;
  whType?: string;
}

export interface ProductQueryPayload {
  result?: StoredStockInfo[];
  information?: ProductInformation;
  productList?: ProductQuantity[];
  prevProduct?: string | null;
  nextProduct?: string | null;
}

export interface OutStockRequestRecord {
  id: number;
  productNo: string;
  lotNo: string;
  type: string;
  quantity: string;
  unit: string;
  color: number;
  defect: string;
  reason: string;
  outStockType: number;
  stockIdentifierId: number;
  fileName?: string;
  handled?: boolean;
  isHandled?: boolean;
  deleted?: boolean;
  isDeleted?: boolean;
  requestFrom?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface HandleListResponse {
  userList?: string[];
  queryResult?: Record<string, OutStockRequestRecord[]>;
}

export interface FieldErrors {
  quantity?: string;
  quantity1?: string;
  quantity2?: string;
  [field: string]: string | undefined;
}

/** Editable in-stock row. Defect is a react-select multi value until submit. */
export interface InStockFormRow {
  productNo: string;
  lotNo: string;
  type: string;
  quantity: string;
  unit: string;
  color?: string | number;
  defect?: DefectOption[] | string;
  record: string;
  remark?: string;
  outStockReason: string;
  errors: FieldErrors;
  directShip?: boolean;
  orderNo?: string;
  inStockType?: string;
  parentId?: number;
}

export interface InStockRequestPayload {
  productNo: string;
  lotNo?: string;
  type: string;
  quantity: string;
  unit?: string;
  color?: number | string;
  defect?: string;
  record?: string;
  remark?: string;
  inStockType?: string;
  orderNo?: string;
  directShip?: boolean;
  outStockReason?: string;
  parentId?: number;
}

export interface SelectedProduct {
  productNo: string;
  selected: boolean;
  index: number;
  isSubmitted: boolean;
}

export interface UserRole {
  authority?: string;
  role?: string;
}

/** JWT session user. Spring serializes the granted authority as role.authority. */
export interface SessionUser {
  id?: string;
  employeeId?: string;
  fullName?: string;
  role?: UserRole;
  exp?: number;
  iat?: number;
  sub?: string;
}

export interface ManagedUser {
  id?: number;
  employeeId: string;
  fullName: string;
  password?: string;
  role?: UserRole | string | null;
}

export interface CategoryOption {
  label: string;
  value: string;
}

export interface HistoryTreeNode {
  stockInfo?: StoredStockInfo;
  nodes?: HistoryTreeNode[];
  title?: string;
  subtitle?: string;
  expanded?: boolean;
  children?: HistoryTreeNode[];
}

export interface ApiStatus {
  status: number;
  data?: unknown;
}
