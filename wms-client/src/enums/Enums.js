// StockIdentifier Type
export const StockIdentifierType = {
  board: "板卷",
  roll: "整支",
  hardware: "雜項"
};

// Used at ModifyBoard-ClothInfo-OutStockModal
export const StoreList = [
  "中壢",
  "新竹",
  "台中",
  "嘉義",
  "台南",
  "鼎山",
  "中山",
  "屏東",
  "西門"
];

// Used at ModifyBoard-ClothInfo-OutStockModal
export const OutStockOtherReason = ["上貨櫃", "轉零碼", "晶品倉"];

// Used at BatchAddClothInfo-EditBoard-ClothContainer-ClothInfo/
//         AssembleClothBoard-ClothContainer-ClothInfo
export const ColorOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Used at BatchAddClothInfo-EditBoard-ClothContainer-ClothInfo/
//         AssembleClothBoard-ClothContainer-ClothInfo/
//         ShrinkBoard-ModifyRequestBoard-ModifyRequestContainer-ModifyRequestInfo
export const DefectOptions = [
  { label: "無", value: "" },
  { label: "GA", value: "GA" },
  { label: "GB", value: "GB" },
  { label: "GC", value: "GC" },
  { label: "GD", value: "GD" },
  { label: "A-", value: "A-" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
  { label: "保留", value: "保留" }
];

// Used at BatchAddClothInfo-EditBoard-ClothContainer-ClothInfo
export const UnitOptions = [
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
];

// Use at UserManagement-Register
export const RoleOption = {
  "請選擇...": "",
  "一般人員/門市": "ROLE_Normal",
  業務: "ROLE_Sales",
  庫存相關人員: "ROLE_Operator",
  管理員: "ROLE_Admin"
};

// Use at ModifyRequestBoard
export const ShrinkType = {
  RtoR: "RR",
  RtoB: "RB",
  BtoB: "BB",
  BtoR: "BR",
  HtoH: "HH"
};
