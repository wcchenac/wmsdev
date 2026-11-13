import {
  quantityAccumulate,
  updateStockInfoesCopy,
  updateStockInfoCopy,
  joinInfoDefectArray,
  joinInfoesDefectArray,
  defectIndexMapper,
  defectStringTransToOptions,
  parseRowCount,
  exceedsRowCountLimit,
  MAX_ASSIGN_ROW_COUNT
} from '../../components/BO/Stock/Utilities/StockInfoHelperMethods';
import { StockIdentifierType, DefectOptions } from '../../enums/Enums';

interface StockInfoQuantity {
  type: string;
  quantity: string;
}

interface StockInfoErrors {
  quantity: string;
  quantity1?: string;
  quantity2?: string;
}

interface StockInfoesCopyItem {
  lotNo: string;
  type: string;
  quantity: string;
  unit: string;
  color: string;
  record: string;
  remark: string;
  outStockReason: string;
  defect?: string | Array<{ value: string } | undefined>;
  errors: StockInfoErrors;
}

interface StockInfoCopyItem {
  lotNo: string;
  type: string;
  quantity: string;
  quantity1: string;
  quantity2: string;
  unit: string;
  color: string;
  record: string;
  remark: string;
  reason: string;
  errors: StockInfoErrors;
}

interface DefectItem {
  value: string;
}

interface StockInfoWithDefect {
  defect: Array<DefectItem | undefined>;
}

describe('StockInfoHelperMethods', () => {
  // 新增複數列數 on 入庫 Step 3 and 減肥 both parse their text input with this.
  describe('parseRowCount', () => {
    test.each([
      ['3', 3],
      [' 3 ', 3],
      [3, 3],
      ['2.7', 2],
      ['', 0],
      ['abc', 0],
      ['3abc', 0],
      ['-2', 0],
      [0, 0],
      ['Infinity', 0],
    ])('%j -> %i', (input, expected) => {
      expect(parseRowCount(input)).toBe(expected);
    });
  });

  describe('exceedsRowCountLimit', () => {
    test('the limit is 50 rows', () => {
      expect(MAX_ASSIGN_ROW_COUNT).toBe(50);
    });

    test.each([
      ['50', false],
      ['50.9', false],
      [50, false],
      ['51', true],
      [51, true],
      ['1e6', true],
      ['', false],
      ['abc', false],
      ['-100', false],
    ])('%j -> %s', (input, expected) => {
      expect(exceedsRowCountLimit(input)).toBe(expected);
    });
  });

  describe('quantityAccumulate', () => {
    test('accumulates quantities by type correctly', () => {
      const stockInfoes: StockInfoQuantity[] = [
        { type: StockIdentifierType.roll, quantity: '10.5' },
        { type: StockIdentifierType.roll, quantity: '5.5' },
        { type: StockIdentifierType.board, quantity: '3.2' },
        { type: StockIdentifierType.hardware, quantity: '2.0' }
      ];
      const result = quantityAccumulate(stockInfoes);

      expect(result['整支']).toBe(16);
      expect(result['板卷']).toBe(3.2);
      expect(result['雜項']).toBe(2);
    });

    // A freshly added row has quantity "" until the user types one; Step 3's 目前數量
    // showed NaN because parseFloat("") is NaN.
    test('treats rows without a numeric quantity as 0', () => {
      const stockInfoes: StockInfoQuantity[] = [
        { type: StockIdentifierType.roll, quantity: '' },
        { type: StockIdentifierType.roll, quantity: '12.5' },
        { type: StockIdentifierType.board, quantity: '' },
        { type: StockIdentifierType.hardware, quantity: '-' }
      ];
      const result = quantityAccumulate(stockInfoes);

      expect(result['整支']).toBe(12.5);
      expect(result['板卷']).toBe(0);
      expect(result['雜項']).toBe(0);
    });

    test('handles empty array', () => {
      const result = quantityAccumulate([]);

      expect(result['整支']).toBe(0);
      expect(result['板卷']).toBe(0);
      expect(result['雜項']).toBe(0);
    });

    test('handles single item of each type', () => {
      const stockInfoes: StockInfoQuantity[] = [
        { type: StockIdentifierType.roll, quantity: '10' },
        { type: StockIdentifierType.board, quantity: '20' },
        { type: StockIdentifierType.hardware, quantity: '30' }
      ];
      const result = quantityAccumulate(stockInfoes);

      expect(result['整支']).toBe(10);
      expect(result['板卷']).toBe(20);
      expect(result['雜項']).toBe(30);
    });

    test('handles decimal precision correctly', () => {
      const stockInfoes: StockInfoQuantity[] = [
        { type: StockIdentifierType.roll, quantity: '0.01' },
        { type: StockIdentifierType.roll, quantity: '0.02' },
        { type: StockIdentifierType.roll, quantity: '0.03' }
      ];
      const result = quantityAccumulate(stockInfoes);

      expect(result['整支']).toBe(0.06);
    });

    test('handles only roll type', () => {
      const stockInfoes: StockInfoQuantity[] = [
        { type: StockIdentifierType.roll, quantity: '5' },
        { type: StockIdentifierType.roll, quantity: '10' }
      ];
      const result = quantityAccumulate(stockInfoes);

      expect(result['整支']).toBe(15);
      expect(result['板卷']).toBe(0);
      expect(result['雜項']).toBe(0);
    });

    test('handles only board type', () => {
      const stockInfoes: StockInfoQuantity[] = [
        { type: StockIdentifierType.board, quantity: '5.5' }
      ];
      const result = quantityAccumulate(stockInfoes);

      expect(result['整支']).toBe(0);
      expect(result['板卷']).toBe(5.5);
      expect(result['雜項']).toBe(0);
    });

    test('handles only hardware type', () => {
      const stockInfoes: StockInfoQuantity[] = [
        { type: StockIdentifierType.hardware, quantity: '3' }
      ];
      const result = quantityAccumulate(stockInfoes);

      expect(result['整支']).toBe(0);
      expect(result['板卷']).toBe(0);
      expect(result['雜項']).toBe(3);
    });
  });

  describe('updateStockInfoesCopy', () => {
    let stockInfoesCopy: StockInfoesCopyItem[];

    beforeEach(() => {
      stockInfoesCopy = [
        {
          lotNo: '',
          type: '',
          quantity: '',
          unit: '',
          color: '',
          record: '',
          remark: '',
          outStockReason: '',
          errors: { quantity: '' }
        }
      ];
    });

    test('updates lotNo', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'lotNo', 'LOT001', 0);
      expect(stockInfoesCopy[0].lotNo).toBe('LOT001');
    });

    test('updates type', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'type', '整支', 0);
      expect(stockInfoesCopy[0].type).toBe('整支');
    });

    test('updates quantity with valid value', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'quantity', '10.5', 0);
      expect(stockInfoesCopy[0].quantity).toBe('10.5');
      expect(stockInfoesCopy[0].errors.quantity).toBe('');
    });

    test('sets error for invalid quantity', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'quantity', 'abc', 0);
      expect(stockInfoesCopy[0].quantity).toBe('abc');
      expect(stockInfoesCopy[0].errors.quantity).toBe('請輸入純數字或數量不可空白');
    });

    test('sets error for empty quantity', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'quantity', '', 0);
      expect(stockInfoesCopy[0].errors.quantity).toBe('請輸入純數字或數量不可空白');
    });

    test('accepts integer quantity', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'quantity', '100', 0);
      expect(stockInfoesCopy[0].errors.quantity).toBe('');
    });

    test('accepts decimal quantity', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'quantity', '10.55', 0);
      expect(stockInfoesCopy[0].errors.quantity).toBe('');
    });

    test('updates unit', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'unit', '碼', 0);
      expect(stockInfoesCopy[0].unit).toBe('碼');
    });

    test('updates color', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'color', '5', 0);
      expect(stockInfoesCopy[0].color).toBe('5');
    });

    test('updates record', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'record', 'test record', 0);
      expect(stockInfoesCopy[0].record).toBe('test record');
    });

    test('updates remark', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'remark', 'test remark', 0);
      expect(stockInfoesCopy[0].remark).toBe('test remark');
    });

    test('updates outStockReason', () => {
      updateStockInfoesCopy(stockInfoesCopy, 'outStockReason', '中壢', 0);
      expect(stockInfoesCopy[0].outStockReason).toBe('中壢');
    });

    test('does nothing for unknown field', () => {
      const original = { ...stockInfoesCopy[0] };
      updateStockInfoesCopy(stockInfoesCopy, 'unknownField', 'value', 0);
      expect(stockInfoesCopy[0].lotNo).toBe(original.lotNo);
    });
  });

  describe('updateStockInfoCopy', () => {
    let stockInfoCopy: StockInfoCopyItem;

    beforeEach(() => {
      stockInfoCopy = {
        lotNo: '',
        type: '',
        quantity: '',
        quantity1: '',
        quantity2: '',
        unit: '',
        color: '',
        record: '',
        remark: '',
        reason: '',
        errors: { quantity: '', quantity1: '', quantity2: '' }
      };
    });

    test('updates quantity with validation', () => {
      updateStockInfoCopy(stockInfoCopy, 'quantity', '10.5');
      expect(stockInfoCopy.quantity).toBe('10.5');
      expect(stockInfoCopy.errors.quantity).toBe('');
    });

    test('updates quantity1 with validation', () => {
      updateStockInfoCopy(stockInfoCopy, 'quantity1', '5');
      expect(stockInfoCopy.quantity1).toBe('5');
      expect(stockInfoCopy.errors.quantity1).toBe('');
    });

    test('updates quantity2 with validation', () => {
      updateStockInfoCopy(stockInfoCopy, 'quantity2', '3.5');
      expect(stockInfoCopy.quantity2).toBe('3.5');
      expect(stockInfoCopy.errors.quantity2).toBe('');
    });

    test('sets error for invalid quantity1', () => {
      updateStockInfoCopy(stockInfoCopy, 'quantity1', 'invalid');
      expect(stockInfoCopy.errors.quantity1).toBe('請輸入純數字或數量不可空白');
    });

    test('updates outStockReason to reason property', () => {
      updateStockInfoCopy(stockInfoCopy, 'outStockReason', '中壢');
      expect(stockInfoCopy.reason).toBe('中壢');
    });
  });

  describe('joinInfoDefectArray', () => {
    test('joins defect values with slash separator', () => {
      const stockInfo: StockInfoWithDefect = {
        defect: [{ value: 'GA' }, { value: 'GB' }, { value: 'GC' }]
      };
      expect(joinInfoDefectArray(stockInfo)).toBe('GA/GB/GC');
    });

    test('handles single defect', () => {
      const stockInfo: StockInfoWithDefect = { defect: [{ value: 'GA' }] };
      expect(joinInfoDefectArray(stockInfo)).toBe('GA');
    });

    test('handles empty defect array', () => {
      const stockInfo: StockInfoWithDefect = { defect: [] };
      expect(joinInfoDefectArray(stockInfo)).toBe('');
    });

    test('handles undefined values in array', () => {
      const stockInfo: StockInfoWithDefect = { defect: [{ value: 'GA' }, undefined, { value: 'GB' }] };
      expect(joinInfoDefectArray(stockInfo)).toBe('GA/GB');
    });

    test('handles defect with empty string value', () => {
      const stockInfo: StockInfoWithDefect = { defect: [{ value: '' }] };
      expect(joinInfoDefectArray(stockInfo)).toBe('');
    });

    test('handles two defects', () => {
      const stockInfo: StockInfoWithDefect = { defect: [{ value: 'GA' }, { value: 'GB' }] };
      expect(joinInfoDefectArray(stockInfo)).toBe('GA/GB');
    });
  });

  describe('joinInfoesDefectArray', () => {
    test('joins defect arrays for multiple stock infos', () => {
      const stockInfoesCopy: StockInfoesCopyItem[] = [
        { defect: [{ value: 'GA' }, { value: 'GB' }] } as unknown as StockInfoesCopyItem,
        { defect: [{ value: 'GC' }] } as unknown as StockInfoesCopyItem
      ];
      joinInfoesDefectArray(stockInfoesCopy);

      expect(stockInfoesCopy[0].defect).toBe('GA/GB');
      expect(stockInfoesCopy[1].defect).toBe('GC');
    });

    test('handles empty stockInfoesCopy array', () => {
      const stockInfoesCopy: StockInfoesCopyItem[] = [];
      joinInfoesDefectArray(stockInfoesCopy);
      expect(stockInfoesCopy).toEqual([]);
    });
  });

  describe('defectIndexMapper', () => {
    test('maps empty string to 0', () => {
      expect(defectIndexMapper('')).toBe(0);
    });

    test('maps GA to 1', () => {
      expect(defectIndexMapper('GA')).toBe(1);
    });

    test('maps GB to 2', () => {
      expect(defectIndexMapper('GB')).toBe(2);
    });

    test('maps GC to 3', () => {
      expect(defectIndexMapper('GC')).toBe(3);
    });

    test('maps GD to 4', () => {
      expect(defectIndexMapper('GD')).toBe(4);
    });

    test('maps A- to 5', () => {
      expect(defectIndexMapper('A-')).toBe(5);
    });

    test('maps B to 6', () => {
      expect(defectIndexMapper('B')).toBe(6);
    });

    test('maps C to 7', () => {
      expect(defectIndexMapper('C')).toBe(7);
    });

    test('maps 保留 to 8', () => {
      expect(defectIndexMapper('保留')).toBe(8);
    });

    test('returns undefined for unknown string', () => {
      expect(defectIndexMapper('unknown')).toBeUndefined();
    });

    test('returns undefined for lowercase ga', () => {
      expect(defectIndexMapper('ga')).toBeUndefined();
    });
  });

  describe('defectStringTransToOptions', () => {
    test('converts single defect string to options array', () => {
      const result = defectStringTransToOptions('GA');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(DefectOptions[1]);
    });

    test('converts multiple defect string to options array', () => {
      const result = defectStringTransToOptions('GA/GB');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(DefectOptions[1]);
      expect(result[1]).toEqual(DefectOptions[2]);
    });

    test('returns empty array for undefined input', () => {
      expect(defectStringTransToOptions(undefined)).toEqual([]);
    });

    test('handles empty string defect', () => {
      const result = defectStringTransToOptions('');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(DefectOptions[0]);
    });

    test('converts three defects correctly', () => {
      const result = defectStringTransToOptions('GA/GB/GC');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(DefectOptions[1]);
      expect(result[1]).toEqual(DefectOptions[2]);
      expect(result[2]).toEqual(DefectOptions[3]);
    });

    test('handles 保留 defect', () => {
      const result = defectStringTransToOptions('保留');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(DefectOptions[8]);
    });
  });
});
