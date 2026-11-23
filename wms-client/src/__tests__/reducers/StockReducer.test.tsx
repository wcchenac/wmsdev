import StockReducer from '../../reducers/StockReducer';
import type { StockInfo, StockInfoesWithResult, StockState } from '../../types';
import {
  GET_Order,
  GET_StockInfo,
  GET_StockInfoes,
  GET_ShrinkList,
  GET_InStockRollbackList,
  GET_ShrinkRollbackList,
  GET_ProductHistory,
  GET_Categories,
  SHIP_Stock,
  SHIP_Stocks,
  SHRINK_Stock,
  CANCEL_SHRINK,
  UPDATE_StockInfo
} from '../../types';

type StockAction = Parameters<typeof StockReducer>[1];

const getOrderWith = (payload: unknown): StockAction => ({ type: GET_Order, payload }) as StockAction;

const initialState: StockState = {
  stockInfoes: [],
  stockInfo: {},
  orderResult: null,
  shrinkList: [],
  inStockRollbackList: {},
  shrinkRollbackList: [],
  productHistory: [],
  categories: []
};

const makeState = (overrides: Partial<StockState> = {}): StockState => ({
  ...initialState,
  ...overrides
});

describe('StockReducer', () => {

  describe('initial state', () => {
    test('returns initial state when no state provided', () => {
      expect(StockReducer(undefined, {} as StockAction)).toEqual(initialState);
    });

    test('returns initial state for unknown action type', () => {
      expect(StockReducer(initialState, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
    });
  });

  describe('GET_Order', () => {
    test('sets orderResult to payload without touching stockInfoes', () => {
      const payload = [{ id: 1, productNo: 'PROD001' }];
      const result = StockReducer(initialState, { type: GET_Order, payload });

      expect(result.orderResult).toEqual(payload);
      expect(result.stockInfoes).toEqual([]);
      expect(result.stockInfo).toEqual({});
    });

    test('replaces existing orderResult', () => {
      const existingState = makeState({
        orderResult: [{ id: 1 }]
      });
      const payload = [{ id: 2 }];
      const result = StockReducer(existingState, { type: GET_Order, payload });

      expect(result.orderResult).toEqual(payload);
    });

    test('handles empty payload', () => {
      const result = StockReducer(initialState, { type: GET_Order, payload: [] });
      expect(result.orderResult).toEqual([]);
    });

    test('handles object payload (for order with status)', () => {
      const payload = {
        currentStatus: { 'PROD001': { roll: 10 } },
        waitHandleStatus: { 'PROD001': { roll: { quantity: '5' } } }
      };
      const result = StockReducer(initialState, getOrderWith(payload));
      expect(result.orderResult).toEqual(payload);
    });
  });

  describe('GET_StockInfoes', () => {
    test('sets stockInfoes to payload', () => {
      const payload = [{ id: 1 }, { id: 2 }];
      const result = StockReducer(initialState, { type: GET_StockInfoes, payload });

      expect(result.stockInfoes).toEqual(payload);
    });

    test('preserves stockInfo when updating stockInfoes', () => {
      const existingState = makeState({
        stockInfo: { id: 1 }
      });
      const payload = [{ id: 2 }];
      const result = StockReducer(existingState, { type: GET_StockInfoes, payload });

      expect(result.stockInfo).toEqual({ id: 1 });
    });
  });

  describe('GET_StockInfo', () => {
    test('sets stockInfo to payload', () => {
      const payload = { id: 1, productNo: 'PROD001', details: 'test' };
      const result = StockReducer(initialState, { type: GET_StockInfo, payload });

      expect(result.stockInfo).toEqual(payload);
      expect(result.stockInfoes).toEqual([]);
    });

    test('replaces existing stockInfo', () => {
      const existingState = makeState({
        stockInfo: { id: 1 }
      });
      const payload = { id: 2 };
      const result = StockReducer(existingState, { type: GET_StockInfo, payload });

      expect(result.stockInfo).toEqual(payload);
    });

    test('preserves stockInfoes when updating stockInfo', () => {
      const existingState = makeState({
        stockInfoes: [{ stockIdentifier: { id: 1 }, id: 10 }]
      });
      const payload = { id: 2 };
      const result = StockReducer(existingState, { type: GET_StockInfo, payload });

      expect(result.stockInfoes).toEqual([{ stockIdentifier: { id: 1 }, id: 10 }]);
    });
  });

  describe('SHIP_Stock', () => {
    test('removes shipped item from stockInfoes.result by stockIdentifier.id', () => {
      const existingState = makeState({
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1, productNo: 'PROD001' } },
            { stockIdentifier: { id: 2, productNo: 'PROD002' } }
          ],
          otherData: 'preserved'
        } as StockInfoesWithResult
      });
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 1 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.result).toHaveLength(1);
      expect(stockInfoes.result[0].stockIdentifier?.id).toBe(2);
      expect(stockInfoes.otherData).toBe('preserved');
    });

    test('removes correct item when multiple items exist', () => {
      const existingState = makeState({
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1 } },
            { stockIdentifier: { id: 2 } },
            { stockIdentifier: { id: 3 } }
          ]
        } as StockInfoesWithResult
      });
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 2 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.result).toHaveLength(2);
      expect(stockInfoes.result.map(s => s.stockIdentifier?.id)).toEqual([1, 3]);
    });

    test('handles payload that does not match any item', () => {
      const existingState = makeState({
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1 } },
            { stockIdentifier: { id: 2 } }
          ]
        } as StockInfoesWithResult
      });
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 999 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.result).toHaveLength(2);
    });

    test('handles empty result array', () => {
      const existingState = makeState({
        stockInfoes: { result: [] } as StockInfoesWithResult
      });
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 1 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.result).toEqual([]);
    });

    test('reduces the matching productList quantity and leaves other types', () => {
      const productList = [
        { type: '板卷', quantity: 10, unit: '碼' },
        { type: '整支', quantity: 2, unit: '支' }
      ];
      const existingState = makeState({
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1, type: '板卷', quantity: 4, unit: '碼' } },
            { stockIdentifier: { id: 2, type: '板卷', quantity: 6, unit: '碼' } }
          ],
          productList
        } as StockInfoesWithResult
      });

      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 1 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.result).toHaveLength(1);
      expect(stockInfoes.productList).toEqual([
        { type: '板卷', quantity: 6, unit: '碼' },
        { type: '整支', quantity: 2, unit: '支' }
      ]);
      expect(productList[0].quantity).toBe(10);
      expect(stockInfoes.productList).not.toBe(productList);
    });

    test('keeps a string productList quantity as a string', () => {
      const existingState = makeState({
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 7, type: '板卷', quantity: 1.5, unit: '碼' } }
          ],
          productList: [{ type: '板卷', quantity: '10.00', unit: '碼' }]
        } as StockInfoesWithResult
      });

      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 7 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.productList).toEqual([
        { type: '板卷', quantity: '8.50', unit: '碼' }
      ]);
    });

    test('filters stock-shaped productList rows by the shipped id', () => {
      const existingState = makeState({
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1 } },
            { stockIdentifier: { id: 2 } }
          ],
          productList: [
            { stockIdentifier: { id: 1, productNo: 'A' } },
            { stockIdentifier: { id: 2, productNo: 'B' } }
          ]
        } as StockInfoesWithResult
      });

      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 1 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.productList).toEqual([
        { stockIdentifier: { id: 2, productNo: 'B' } }
      ]);
    });

    test('rounds productList quantity with round10 and normalizes zero', () => {
      const existingState = makeState({
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1, type: '板卷', quantity: 9, unit: '碼' } },
            { stockIdentifier: { id: 2, type: '整支', quantity: 1.5, unit: '支' } }
          ],
          productList: [
            { type: '板卷', quantity: 10.005, unit: '碼' },
            { type: '整支', quantity: 1.5, unit: '支' }
          ]
        } as StockInfoesWithResult
      });

      const afterFirst = StockReducer(existingState, { type: SHIP_Stock, payload: 1 });
      const afterSecond = StockReducer(afterFirst, { type: SHIP_Stock, payload: 2 });
      const stockInfoes = afterSecond.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.productList).toEqual([
        { type: '板卷', quantity: 1.01, unit: '碼' },
        { type: '整支', quantity: 0, unit: '支' }
      ]);
    });
  });

  describe('SHIP_Stocks', () => {
    test('sets stockInfoes to payload', () => {
      const payload = { result: [{ id: 3 }] };
      const result = StockReducer(initialState, { type: SHIP_Stocks, payload });

      expect(result.stockInfoes).toEqual(payload);
    });
  });

  describe('SHRINK_Stock', () => {
    test('sets stockInfoes to payload', () => {
      const payload = [{ id: 1, shrinkType: 'RR' }];
      const result = StockReducer(initialState, { type: SHRINK_Stock, payload });

      expect(result.stockInfoes).toEqual(payload);
    });
  });

  describe('CANCEL_SHRINK', () => {
    test('removes cancelled item from shrinkList by stockIdentifier.id', () => {
      const existingState = makeState({
        shrinkList: [
          { stockIdentifier: { id: 1, productNo: 'PROD001' } },
          { stockIdentifier: { id: 2, productNo: 'PROD002' } }
        ] as StockInfo[]
      });
      const result = StockReducer(existingState, { type: CANCEL_SHRINK, payload: 1 });

      expect(result.shrinkList).toHaveLength(1);
      expect(result.shrinkList[0].stockIdentifier?.id).toBe(2);
    });

    test('removes correct item when multiple items exist', () => {
      const existingState = makeState({
        shrinkList: [
          { stockIdentifier: { id: 1 } },
          { stockIdentifier: { id: 2 } },
          { stockIdentifier: { id: 3 } }
        ] as StockInfo[]
      });
      const result = StockReducer(existingState, { type: CANCEL_SHRINK, payload: 2 });

      expect(result.shrinkList).toHaveLength(2);
      expect(result.shrinkList.map(s => s.stockIdentifier?.id)).toEqual([1, 3]);
    });

    test('handles payload that does not match any item', () => {
      const existingState = makeState({
        shrinkList: [
          { stockIdentifier: { id: 1 } },
          { stockIdentifier: { id: 2 } }
        ] as StockInfo[]
      });
      const result = StockReducer(existingState, { type: CANCEL_SHRINK, payload: 999 });

      expect(result.shrinkList).toHaveLength(2);
    });

    test('handles empty shrinkList array', () => {
      const result = StockReducer(initialState, { type: CANCEL_SHRINK, payload: 1 });
      expect(result.shrinkList).toEqual([]);
    });
  });

  describe('dedicated slices (C-2)', () => {
    test('GET_ShrinkList updates shrinkList without touching stockInfoes', () => {
      const payload = [{ stockIdentifier: { id: 9 } }] as StockInfo[];
      const result = StockReducer(initialState, { type: GET_ShrinkList, payload });
      expect(result.shrinkList).toEqual(payload);
      expect(result.stockInfoes).toEqual([]);
    });

    test('GET_InStockRollbackList updates inStockRollbackList', () => {
      const payload = { CF1001: [{ id: 1 }] };
      const result = StockReducer(initialState, { type: GET_InStockRollbackList, payload });
      expect(result.inStockRollbackList).toEqual(payload);
    });

    test('GET_ShrinkRollbackList updates shrinkRollbackList', () => {
      const payload = [{ stockInfo: { id: 1 }, nodes: [] }];
      const result = StockReducer(initialState, { type: GET_ShrinkRollbackList, payload });
      expect(result.shrinkRollbackList).toEqual(payload);
    });

    test('GET_ProductHistory updates productHistory', () => {
      const payload = [{ stockInfo: { id: 1 }, nodes: [] }];
      const result = StockReducer(initialState, { type: GET_ProductHistory, payload });
      expect(result.productHistory).toEqual(payload);
    });

    test('GET_Categories updates categories', () => {
      const payload = [{ value: '棉', label: '棉' }];
      const result = StockReducer(initialState, { type: GET_Categories, payload });
      expect(result.categories).toEqual(payload);
    });
  });

  describe('UPDATE_StockInfo', () => {
    test('sets stockInfoes to payload', () => {
      const payload = { result: [{ id: 3 }] };
      const result = StockReducer(initialState, { type: UPDATE_StockInfo, payload });

      expect(result.stockInfoes).toEqual(payload);
    });

    test('replaces existing stockInfoes', () => {
      const existingState = makeState({
        stockInfoes: [{ stockIdentifier: { id: 1 }, id: 1 }]
      });
      const payload = [{ id: 2, remark: 'updated' }];
      const result = StockReducer(existingState, { type: UPDATE_StockInfo, payload });

      expect(result.stockInfoes).toEqual(payload);
    });
  });

  describe('state immutability', () => {
    test('does not mutate original state', () => {
      const originalState = makeState({
        stockInfoes: [{ stockIdentifier: { id: 1 }, id: 1 }],
        stockInfo: { id: 5 }
      });
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      StockReducer(originalState, { type: GET_Order, payload: [{ id: 2 }] });

      expect(originalState).toEqual(stateCopy);
    });
  });
});
