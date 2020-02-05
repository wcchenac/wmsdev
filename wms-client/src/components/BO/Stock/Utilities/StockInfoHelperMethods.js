import { DefectOptions } from "../../../../enums/Enums";

// accumulate the total quantity by type
export function quantityAccumulate(stockInfoes) {
  let roll = 0.0;
  let board = 0.0;
  let item = 0.0;

  for (let i = 0; i < stockInfoes.length; i += 1) {
    if (stockInfoes[i].type === "整支") {
      roll += parseFloat(stockInfoes[i].quantity);
    }
    if (stockInfoes[i].type === "板卷") {
      board += parseFloat(stockInfoes[i].quantity);
    }
    if (stockInfoes[i].type === "雜項") {
      item += parseFloat(stockInfoes[i].quantity);
    }
  }

  return { 整支: roll, 板卷: board, 雜項: item };
}

// update the value at stockInfoesCopy[i].[name]
export function updateStockInfoesCopy(stockInfoesCopy, name, value, i) {
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
    default:
      break;
  }
}

// update the value at stockInfoesCopy.[name]
export function updateStockInfoCopy(stockInfoCopy, name, value) {
  switch (name) {
    case "lotNo":
      stockInfoCopy.lotNo = value;
      break;
    case "type":
      stockInfoCopy.type = value;
      break;
    case "quantity":
      stockInfoCopy.errors.quantity = /^\d*\.?\d+$/.test(value)
        ? ""
        : "請輸入純數字或數量不可空白";
      stockInfoCopy.quantity = value;
      break;
    case "quantity1":
      stockInfoCopy.errors.quantity1 = /^\d*\.?\d+$/.test(value)
        ? ""
        : "請輸入純數字或數量不可空白";
      stockInfoCopy.quantity1 = value;
      break;
    case "quantity2":
      stockInfoCopy.errors.quantity2 = /^\d*\.?\d+$/.test(value)
        ? ""
        : "請輸入純數字或數量不可空白";
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
export function joinInfoesDefectArray(stockInfoesCopy) {
  stockInfoesCopy.forEach((stockInfo, index) => {
    stockInfoesCopy[index].defect = joinInfoDefectArray(stockInfo);
  });
}

// join stockInfo.defect array contents
export function joinInfoDefectArray(stockInfo) {
  let newDefectContent = "";

  stockInfo.defect.forEach((object, index) => {
    if (index === stockInfo.defect.length - 1) {
      newDefectContent = newDefectContent + object.value;
    } else {
      newDefectContent = newDefectContent + object.value + "/";
    }
  });

  return newDefectContent;
}

// translate defect string to option index
export function defectIndexMapper(string) {
  let index = undefined;

  switch (string) {
    case "無":
      index = 0;
      break;
    case "GA":
      index = 1;
      break;
    case "GB":
      index = 2;
      break;
    case "GC":
      index = 3;
      break;
    case "GD":
      index = 4;
      break;
    case "A-":
      index = 5;
      break;
    case "B":
      index = 6;
      break;
    case "C":
      index = 7;
      break;
    case "保留":
      index = 8;
      break;
    default:
      break;
  }

  return index;
}

// translate composite defect string to option object
export function defectStringTransToOptions(defectString) {
  let defectSelected = [];

  if (defectString === undefined) {
    return defectSelected;
  }

  let stringArray = defectString.split("/");

  stringArray.forEach(string => {
    defectSelected.push(DefectOptions[defectIndexMapper(string)]);
  });

  return defectSelected;
}
