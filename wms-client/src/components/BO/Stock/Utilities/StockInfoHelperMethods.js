import { DefectOptions, StockIdentifierType } from '../../../../enums/Enums';

// accumulate the total quantity by type
export function quantityAccumulate(stockInfoes) {
    (function () {
        /**
         * Decimal adjustment of a number.
         *
         * @param {String}  type  The type of adjustment.
         * @param {Number}  value The number.
         * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
         * @returns {Number} The adjusted value.
         */
        function decimalAdjust(type, value, exp) {
            // If the exp is undefined or zero...
            if (typeof exp === 'undefined' || +exp === 0) {
                return Math[type](value);
            }
            value = +value;
            exp = +exp;
            // If the value is not a number or the exp is not an integer...
            if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
                return NaN;
            }
            // Shift
            value = value.toString().split('e');
            value = Math[type](
                +(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp)),
            );
            // Shift back
            value = value.toString().split('e');
            return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp));
        }

        // Decimal round
        if (!Math.round10) {
            Math.round10 = function (value, exp) {
                return decimalAdjust('round', value, exp);
            };
        }
        // Decimal floor
        if (!Math.floor10) {
            Math.floor10 = function (value, exp) {
                return decimalAdjust('floor', value, exp);
            };
        }
        // Decimal ceil
        if (!Math.ceil10) {
            Math.ceil10 = function (value, exp) {
                return decimalAdjust('ceil', value, exp);
            };
        }
    })();

    let roll = 0.0;
    let board = 0.0;
    let item = 0.0;

    for (let i = 0; i < stockInfoes.length; i += 1) {
        if (stockInfoes[i].type === StockIdentifierType.roll) {
            roll += parseFloat(stockInfoes[i].quantity);
        }
        if (stockInfoes[i].type === StockIdentifierType.board) {
            board += parseFloat(stockInfoes[i].quantity);
        }
        if (stockInfoes[i].type === StockIdentifierType.hardware) {
            item += parseFloat(stockInfoes[i].quantity);
        }
    }

    return {
        整支: Math.round10(roll, -2),
        板卷: Math.round10(board, -2),
        雜項: Math.round10(item, -2),
    };
}

// update the value at stockInfoesCopy[i].[name]
export function updateStockInfoesCopy(stockInfoesCopy, name, value, i) {
    switch (name) {
        case 'lotNo':
            stockInfoesCopy[i].lotNo = value;
            break;
        case 'type':
            stockInfoesCopy[i].type = value;
            break;
        case 'quantity':
            stockInfoesCopy[i].errors.quantity = /^\d*\.?\d+$/.test(value)
                ? ''
                : '請輸入純數字或數量不可空白';
            stockInfoesCopy[i].quantity = value;
            break;
        case 'unit':
            stockInfoesCopy[i].unit = value;
            break;
        case 'color':
            stockInfoesCopy[i].color = value;
            break;
        case 'record':
            stockInfoesCopy[i].record = value;
            break;
        case 'remark':
            stockInfoesCopy[i].remark = value;
            break;
        case 'outStockReason':
            stockInfoesCopy[i].outStockReason = value;
            break;
        default:
            break;
    }
}

// update the value at stockInfoesCopy.[name]
export function updateStockInfoCopy(stockInfoCopy, name, value) {
    switch (name) {
        case 'lotNo':
            stockInfoCopy.lotNo = value;
            break;
        case 'type':
            stockInfoCopy.type = value;
            break;
        case 'quantity':
            stockInfoCopy.errors.quantity = /^\d*\.?\d+$/.test(value)
                ? ''
                : '請輸入純數字或數量不可空白';
            stockInfoCopy.quantity = value;
            break;
        case 'quantity1':
            stockInfoCopy.errors.quantity1 = /^\d*\.?\d+$/.test(value)
                ? ''
                : '請輸入純數字或數量不可空白';
            stockInfoCopy.quantity1 = value;
            break;
        case 'quantity2':
            stockInfoCopy.errors.quantity2 = /^\d*\.?\d+$/.test(value)
                ? ''
                : '請輸入純數字或數量不可空白';
            stockInfoCopy.quantity2 = value;
            break;
        case 'unit':
            stockInfoCopy.unit = value;
            break;
        case 'color':
            stockInfoCopy.color = value;
            break;
        case 'record':
            stockInfoCopy.record = value;
            break;
        case 'remark':
            stockInfoCopy.remark = value;
            break;
        case 'outStockReason':
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
    let newDefectContent = '';

    stockInfo.defect.forEach((object, index) => {
        if (object === undefined) {
            return newDefectContent;
        }

        if (index === stockInfo.defect.length - 1) {
            newDefectContent = newDefectContent + object.value;
        } else {
            newDefectContent = newDefectContent + object.value + '/';
        }
    });

    return newDefectContent;
}

// translate defect string to option index
export function defectIndexMapper(string) {
    switch (string) {
        case '':
            return 0;
        case 'GA':
            return 1;
        case 'GB':
            return 2;
        case 'GC':
            return 3;
        case 'GD':
            return 4;
        case 'A-':
            return 5;
        case 'B':
            return 6;
        case 'C':
            return 7;
        case '保留':
            return 8;
        default:
            return undefined;
    }
}

// translate composite defect string to option object
export function defectStringTransToOptions(defectString) {
    let defectSelected = [];

    if (defectString === undefined) {
        return defectSelected;
    }

    let stringArray = defectString.split('/');

    stringArray.forEach((string) => {
        defectSelected.push(DefectOptions[defectIndexMapper(string)]);
    });

    return defectSelected;
}
