import { DefectOptions, DefectOption, StockIdentifierType } from "../../../../enums/Enums";
import { round10 } from "../../../../utilities/DecimalAdjust";

interface StockInfoBase {
  type: string;
  quantity: string | number;
  lotNo?: string;
  unit?: string;
  color?: string | number;
  record?: string;
  remark?: string;
  outStockReason?: string;
  reason?: string;
  defect: (DefectOption | undefined)[] | DefectOption[] | string;
  errors: {
    quantity?: string;
    quantity1?: string;
    quantity2?: string;
  };
  quantity1?: string | number;
  quantity2?: string | number;
}

interface StockInfo extends StockInfoBase {
  defect: (DefectOption | undefined)[];
}

interface QuantityAccumulateResult {
  整支: number;
  板卷: number;
  雜項: number;
}

// Parse a row's quantity for totals. A quantity that is still empty (or not yet
// a number) counts as 0, otherwise one blank row turns the whole total into NaN.
export function parseQuantity(quantity: string | number | null | undefined): number {
  const value = parseFloat(String(quantity ?? ""));
  return Number.isNaN(value) ? 0 : value;
}

// Parse the 新增複數列數 input (a free-text field) into how many rows to add:
// the whole-number part of a non-negative number, or 0 for anything else
// ("", "abc", "3abc", "-2", "Infinity").
export function parseRowCount(value: string | number): number {
  const text = String(value).trim();
  if (text === "") {
    return 0;
  }
  const count = Number(text);
  return Number.isFinite(count) && count > 0 ? Math.trunc(count) : 0;
}

// Most rows 新增複數列數 may add at once; a typo like 1000 would otherwise render
// that many form rows and freeze the page.
export const MAX_ASSIGN_ROW_COUNT = 50;

export function exceedsRowCountLimit(value: string | number): boolean {
  return parseRowCount(value) > MAX_ASSIGN_ROW_COUNT;
}

// accumulate the total quantity by type
export function quantityAccumulate(stockInfoes: StockInfo[]): QuantityAccumulateResult {
  let roll = 0.0;
  let board = 0.0;
  let item = 0.0;

  for (let i = 0; i < stockInfoes.length; i += 1) {
    if (stockInfoes[i].type === StockIdentifierType.roll) {
      roll += parseQuantity(stockInfoes[i].quantity);
    }
    if (stockInfoes[i].type === StockIdentifierType.board) {
      board += parseQuantity(stockInfoes[i].quantity);
    }
    if (stockInfoes[i].type === StockIdentifierType.hardware) {
      item += parseQuantity(stockInfoes[i].quantity);
    }
  }

  return {
    整支: round10(roll, -2),
    板卷: round10(board, -2),
    雜項: round10(item, -2),
  };
}

type StockInfoField =
  | "lotNo"
  | "type"
  | "quantity"
  | "unit"
  | "color"
  | "record"
  | "remark"
  | "outStockReason";

// update the value at stockInfoesCopy[i].[name]
export function updateStockInfoesCopy(
  stockInfoesCopy: StockInfo[],
  name: StockInfoField,
  value: string,
  i: number
): void {
  switch (name) {
    case "lotNo":
      stockInfoesCopy[i].lotNo = value;
      break;
    case "type":
      stockInfoesCopy[i].type = value;
      break;
    case "quantity":
      stockInfoesCopy[i].errors.quantity = /^\d*\.?\d+$/.test(value)
        ? ""
        : "請輸入純數字或數量不可空白";
      stockInfoesCopy[i].quantity = value;
      break;
    case "unit":
      stockInfoesCopy[i].unit = value;
      break;
    case "color":
      stockInfoesCopy[i].color = value;
      break;
    case "record":
      stockInfoesCopy[i].record = value;
      break;
    case "remark":
      stockInfoesCopy[i].remark = value;
      break;
    case "outStockReason":
      stockInfoesCopy[i].outStockReason = value;
      break;
    default:
      break;
  }
}

type StockInfoCopyField =
  | "lotNo"
  | "type"
  | "quantity"
  | "quantity1"
  | "quantity2"
  | "unit"
  | "color"
  | "record"
  | "remark"
  | "outStockReason";

// Generic interface for updateStockInfoCopy to support various stock info shapes
interface StockInfoCopyTarget {
  lotNo?: string;
  type?: string;
  quantity?: string | number;
  quantity1?: string | number;
  quantity2?: string | number;
  unit?: string;
  color?: string | number;
  record?: string;
  remark?: string;
  reason?: string;
  errors?: {
    quantity?: string;
    quantity1?: string;
    quantity2?: string;
  };
}

// update the value at stockInfoesCopy.[name]
export function updateStockInfoCopy(
  stockInfoCopy: StockInfoCopyTarget,
  name: StockInfoCopyField | string,
  value: string
): void {
  switch (name) {
    case "lotNo":
      stockInfoCopy.lotNo = value;
      break;
    case "type":
      stockInfoCopy.type = value;
      break;
    case "quantity":
      if (stockInfoCopy.errors) {
        stockInfoCopy.errors.quantity = /^\d*\.?\d+$/.test(value)
          ? ""
          : "請輸入純數字或數量不可空白";
      }
      stockInfoCopy.quantity = value;
      break;
    case "quantity1":
      if (stockInfoCopy.errors) {
        stockInfoCopy.errors.quantity1 = /^\d*\.?\d+$/.test(value)
          ? ""
          : "請輸入純數字或數量不可空白";
      }
      stockInfoCopy.quantity1 = value;
      break;
    case "quantity2":
      if (stockInfoCopy.errors) {
        stockInfoCopy.errors.quantity2 = /^\d*\.?\d+$/.test(value)
          ? ""
          : "請輸入純數字或數量不可空白";
      }
      stockInfoCopy.quantity2 = value;
      break;
    case "unit":
      stockInfoCopy.unit = value;
      break;
    case "color":
      stockInfoCopy.color = value;
      break;
    case "record":
      stockInfoCopy.record = value;
      break;
    case "remark":
      stockInfoCopy.remark = value;
      break;
    case "outStockReason":
      stockInfoCopy.reason = value;
      break;
    default:
      break;
  }
}

// join stockInfo.defect array contents for infoes
export function joinInfoesDefectArray(stockInfoesCopy: StockInfo[]): void {
  stockInfoesCopy.forEach((stockInfo, index) => {
    (stockInfoesCopy[index].defect as unknown as string) =
      joinInfoDefectArray(stockInfo);
  });
}

// Interface for objects with defect array
interface StockInfoWithDefectArray {
  defect: (DefectOption | undefined)[] | DefectOption[];
}

// join stockInfo.defect array contents
export function joinInfoDefectArray(stockInfo: StockInfoWithDefectArray): string {
  let newDefectContent = "";

  const defectArray = stockInfo.defect as (DefectOption | undefined)[];

  defectArray.forEach((object, index) => {
    if (object === undefined) {
      return newDefectContent;
    }

    if (index === defectArray.length - 1) {
      newDefectContent = newDefectContent + object.value;
    } else {
      newDefectContent = newDefectContent + object.value + "/";
    }
  });

  return newDefectContent;
}

// translate defect string to option index
export function defectIndexMapper(string: string): number | undefined {
  switch (string) {
    case "":
      return 0;
    case "GA":
      return 1;
    case "GB":
      return 2;
    case "GC":
      return 3;
    case "GD":
      return 4;
    case "A-":
      return 5;
    case "B":
      return 6;
    case "C":
      return 7;
    case "保留":
      return 8;
    default:
      return undefined;
  }
}

// translate composite defect string to option object
export function defectStringTransToOptions(
  defectString: string | undefined
): DefectOption[] {
  const defectSelected: DefectOption[] = [];

  if (defectString === undefined) {
    return defectSelected;
  }

  const stringArray = defectString.split("/");

  stringArray.forEach((string) => {
    const index = defectIndexMapper(string);
    if (index !== undefined) {
      defectSelected.push(DefectOptions[index]);
    }
  });

  return defectSelected;
}
