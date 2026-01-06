// StockIdentifier Type
export const StockIdentifierType: Record<string, string> = {
  board: "板卷",
  roll: "整支",
  hardware: "雜項"
} as const;

export type StockIdentifierTypeKey = keyof typeof StockIdentifierType;

// Used at ModifyBoard-ClothInfo-OutStockModal
export const StoreList: readonly string[] = [
  "中壢",
  "新竹",
  "台中",
  "嘉義",
  "台南",
  "鼎山",
  "中山",
  "屏東",
  "西門"
] as const;

export type StoreName = (typeof StoreList)[number];

// Used at ModifyBoard-ClothInfo-OutStockModal
export const OutStockOtherReason: readonly string[] = ["上貨櫃", "轉零碼", "晶品倉"] as const;

export type OutStockOtherReasonType = (typeof OutStockOtherReason)[number];

// Used at BatchAddClothInfo-EditBoard-ClothContainer-ClothInfo/
//         AssembleClothBoard-ClothContainer-ClothInfo
export const ColorOptions: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type ColorOption = (typeof ColorOptions)[number];

// Defect option interface
export interface DefectOption {
  label: string;
  value: string;
}

// Used at BatchAddClothInfo-EditBoard-ClothContainer-ClothInfo/
//         AssembleClothBoard-ClothContainer-ClothInfo/
//         ShrinkBoard-ModifyRequestBoard-ModifyRequestContainer-ModifyRequestInfo
export const DefectOptions: readonly DefectOption[] = [
  { label: "無", value: "" },
  { label: "GA", value: "GA" },
  { label: "GB", value: "GB" },
  { label: "GC", value: "GC" },
  { label: "GD", value: "GD" },
  { label: "A-", value: "A-" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
  { label: "保留", value: "保留" }
] as const;

// Used at BatchAddClothInfo-EditBoard-ClothContainer-ClothInfo
export const UnitOptions: readonly string[] = [
  "碼",
  "尺",
  "台",
  "支",
  "公斤",
  "公尺",
  "個",
  "打",
  "包",
  "箱",
  "件",
  "對",
  "本",
  "張",
  "才",
  "幅",
  "盒",
  "瓶",
  "磅",
  "批",
  "條",
  "筆",
  "雙",
  "公克",
  "次",
  "疊",
  "組"
] as const;

export type UnitOption = (typeof UnitOptions)[number];

// Use at UserManagement-Register
export const RoleOption: Record<string, string> = {
  "請選擇...": "",
  "一般人員/門市": "ROLE_Normal",
  業務: "ROLE_Sales",
  庫存相關人員: "ROLE_Operator",
  管理員: "ROLE_Admin"
} as const;

export type RoleOptionKey = keyof typeof RoleOption;
export type RoleOptionValue = (typeof RoleOption)[RoleOptionKey];

// Use at ModifyRequestBoard
export const ShrinkType: Record<string, string> = {
  RtoR: "RR",
  RtoB: "RB",
  BtoB: "BB",
  BtoR: "BR",
  HtoH: "HH"
} as const;

export type ShrinkTypeKey = keyof typeof ShrinkType;
export type ShrinkTypeValue = (typeof ShrinkType)[ShrinkTypeKey];

// Use at InStockRollback
export const OrderType: Record<string, string> = {
  "請選擇...": "",
  進貨單: "normal",
  組裝單: "assemble",
  退貨單: "customerReturn",
  調撥單: "storeReturn"
} as const;

export type OrderTypeKey = keyof typeof OrderType;
export type OrderTypeValue = (typeof OrderType)[OrderTypeKey];
