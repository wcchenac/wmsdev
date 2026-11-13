import { calculateInfoLength } from '../../../../../../components/BO/Stock/ModifyStock/ShrinkBoard/calculateInfoLength';
import type { NewStockInfoItem } from '../../../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ModifyRequestBoard';
import { StockIdentifierType } from '../../../../../../enums/Enums';
import type { StockInfo } from '../../../../../../types';

const oldStock = (type: string, quantity: number): StockInfo =>
  ({ stockIdentifier: { type, quantity } }) as StockInfo;

const row = (type: string, quantity: string): NewStockInfoItem => ({
  productNo: 'CF1002',
  lotNo: 'M2510',
  type,
  quantity,
  unit: '碼',
  color: '',
  defect: [],
  record: '',
  remark: '',
  inStockType: 'shrink',
  directShip: false,
  outStockReason: '',
  parentId: 1,
  errors: { quantity: '' },
});

const { roll, board, hardware } = StockIdentifierType;

describe('calculateInfoLength', () => {
  test('same type: adjustment is the new total minus the old length', () => {
    const result = calculateInfoLength(oldStock(roll, 28), [row(roll, '10'), row(roll, '17.5')]);

    expect(result).toEqual({ adjustment: -0.5, totalQuantity: 27.5, allocation: 0, shrinkType: 'RR' });
  });

  test('type exchange: rows of another type are counted as allocation', () => {
    const result = calculateInfoLength(oldStock(board, 28), [row(board, '10'), row(roll, '18')]);

    expect(result).toEqual({ adjustment: 0, totalQuantity: 28, allocation: 18, shrinkType: 'BR' });
  });

  test('hardware keeps the HH shrink type', () => {
    expect(calculateInfoLength(oldStock(hardware, 24), [row(hardware, '24')]).shrinkType).toBe('HH');
  });

  // A freshly added row has quantity "" until the user types one.
  test('rows without a numeric quantity count as 0 instead of making the result NaN', () => {
    const result = calculateInfoLength(oldStock(board, 28), [
      row(board, '10'),
      row(roll, ''),
      row(roll, '-'),
    ]);

    expect(result).toEqual({ adjustment: -18, totalQuantity: 10, allocation: 0, shrinkType: 'BR' });
  });

  test('all rows empty gives a zero total', () => {
    const result = calculateInfoLength(oldStock(roll, 28), [row(roll, ''), row(roll, '')]);

    expect(result).toEqual({ adjustment: -28, totalQuantity: 0, allocation: 0, shrinkType: 'RR' });
  });
});
