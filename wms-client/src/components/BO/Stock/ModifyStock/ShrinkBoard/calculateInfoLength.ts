import equal from "fast-deep-equal";
import { StockIdentifierType, ShrinkType } from "../../../../../enums/Enums";
import { parseQuantity } from "../../Utilities/StockInfoHelperMethods";
import { round10 } from "../../../../../utilities/DecimalAdjust";
import type { StockInfo } from "../../../../../types";
import type { InfoLengthCalculation, NewStockInfoItem } from "./ModifyRequestBoard";

// Compare the shrink rows against the original stock: length adjustment, how much
// moved to another type, and which shrink type this is. Rows whose quantity is
// still empty count as 0.
export function calculateInfoLength(
    oldStockInfo: StockInfo,
    newStockInfoes: NewStockInfoItem[],
): InfoLengthCalculation {
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
        adjustment: round10(adjustment, -1),
        totalQuantity: totalQuantity,
        allocation: 0,
        shrinkType: "",
    };

    if (typeDifference) {
        result.allocation = round10(allocation, -1);

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
