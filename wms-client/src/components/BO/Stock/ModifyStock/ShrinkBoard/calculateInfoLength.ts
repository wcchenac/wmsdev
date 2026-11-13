import equal from "fast-deep-equal";
import { StockIdentifierType, ShrinkType } from "../../../../../enums/Enums";
import { parseQuantity } from "../../Utilities/StockInfoHelperMethods";
import type { StockInfo } from "../../../../../types";
import type { InfoLengthCalculation, NewStockInfoItem } from "./ModifyRequestBoard";

// Decimal rounding (Math.round10 etc.), installed once on Math.
function installDecimalAdjust(): void {
    function decimalAdjust(type: "round" | "floor" | "ceil", value: number, exp: number): number {
        if (typeof exp === "undefined" || +exp === 0) {
            return Math[type](value);
        }
        const valueNum = +value;
        const expNum = +exp;
        if (isNaN(valueNum) || !(typeof expNum === "number" && expNum % 1 === 0)) {
            return NaN;
        }
        const valueArr = valueNum.toString().split("e");
        const shifted = Math[type](
            +(valueArr[0] + "e" + (valueArr[1] ? +valueArr[1] - expNum : -expNum)),
        );
        const shiftedArr = shifted.toString().split("e");
        return +(shiftedArr[0] + "e" + (shiftedArr[1] ? +shiftedArr[1] + expNum : expNum));
    }

    if (!Math.round10) {
        Math.round10 = (value: number, exp: number): number => decimalAdjust("round", value, exp);
    }
    if (!Math.floor10) {
        Math.floor10 = (value: number, exp: number): number => decimalAdjust("floor", value, exp);
    }
    if (!Math.ceil10) {
        Math.ceil10 = (value: number, exp: number): number => decimalAdjust("ceil", value, exp);
    }
}

// Compare the shrink rows against the original stock: length adjustment, how much
// moved to another type, and which shrink type this is. Rows whose quantity is
// still empty count as 0.
export function calculateInfoLength(
    oldStockInfo: StockInfo,
    newStockInfoes: NewStockInfoItem[],
): InfoLengthCalculation {
    installDecimalAdjust();

    const oldTotalLength = parseQuantity(oldStockInfo.stockIdentifier?.quantity);
    const oldType = oldStockInfo.stockIdentifier?.type;
    let typeDifference = false;
    let totalQuantity = 0;
    let allocation = 0;

    for (let i = 0; i < newStockInfoes.length; i += 1) {
        const childQuantity = parseQuantity(newStockInfoes[i].quantity);
        totalQuantity += childQuantity;

        if (!equal(oldType, newStockInfoes[i].type)) {
            allocation += childQuantity;
            typeDifference = true;
        }
    }

    const adjustment = totalQuantity - oldTotalLength;

    const result: InfoLengthCalculation = {
        adjustment: Math.round10(adjustment, -1),
        totalQuantity: totalQuantity,
        allocation: 0,
        shrinkType: "",
    };

    if (typeDifference) {
        result.allocation = Math.round10(allocation, -1);

        if (oldType === StockIdentifierType.board) {
            result.shrinkType = ShrinkType.BtoR;
        }
        if (oldType === StockIdentifierType.roll) {
            result.shrinkType = ShrinkType.RtoB;
        }
    } else {
        result.allocation = 0;

        if (oldType === StockIdentifierType.board) {
            result.shrinkType = ShrinkType.BtoB;
        }
        if (oldType === StockIdentifierType.roll) {
            result.shrinkType = ShrinkType.RtoR;
        }
        if (oldType === StockIdentifierType.hardware) {
            result.shrinkType = ShrinkType.HtoH;
        }
    }

    return result;
}
