import StockReducer from '../../reducers/StockReducer';
import type { StockInfo, StockInfoesWithResult, StockState } from '../../types';
import {
  GET_Order,
  GET_StockInfo,
  GET_StockInfoes,
  SHIP_Stock,
  SHIP_Stocks,
  SHRINK_Stock,
  CANCEL_SHRINK,
  UPDATE_StockInfo
} from '../../types';

type StockAction = Parameters<typeof StockReducer>[1];

// GET_Order stores the order-status response ({ currentStatus, waitHandleStatus }) in
// stockInfoes, a shape StockState does not model (the boards cast it, e.g. NormalStockBoard's
// `result as StockInfoesResponse`). Until that type is fixed, the test builds this action here.
const getOrderWith = (payload: unknown): StockAction => ({ type: GET_Order, payload }) as StockAction;

describe('StockReducer', () => {
  const initialState: StockState = {
    stockInfoes: [],
    stockInfo: {}
  };

  describe('initial state', () => {
    test('returns initial state when no state provided', () => {
      expect(StockReducer(undefined, {} as StockAction)).toEqual(initialState);
    });

    test('returns initial state for unknown action type', () => {
      expect(StockReducer(initialState, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
    });
  });

  describe('GET_Order', () => {
    test('sets stockInfoes to payload', () => {
      const payload = [{ id: 1, productNo: 'PROD001' }];
      const result = StockReducer(initialState, { type: GET_Order, payload });

      expect(result.stockInfoes).toEqual(payload);
      expect(result.stockInfo).toEqual({});
    });

    test('replaces existing stockInfoes', () => {
      const existingState: StockState = {
        stockInfoes: [{ stockIdentifier: { id: 1 }, id: 1 }],
        stockInfo: {}
      };
      const payload = [{ id: 2 }];
      const result = StockReducer(existingState, { type: GET_Order, payload });

      expect(result.stockInfoes).toEqual(payload);
    });

    test('handles empty payload', () => {
      const result = StockReducer(initialState, { type: GET_Order, payload: [] });
      expect(result.stockInfoes).toEqual([]);
    });

    test('handles object payload (for order with status)', () => {
      const payload = {
        currentStatus: { 'PROD001': { roll: 10 } },
        waitHandleStatus: { 'PROD001': { roll: { quantity: '5' } } }
      };
      const result = StockReducer(initialState, getOrderWith(payload));
      expect(result.stockInfoes).toEqual(payload);
    });
  });

  describe('GET_StockInfoes', () => {
    test('sets stockInfoes to payload', () => {
      const payload = [{ id: 1 }, { id: 2 }];
      const result = StockReducer(initialState, { type: GET_StockInfoes, payload });

      expect(result.stockInfoes).toEqual(payload);
    });

    test('preserves stockInfo when updating stockInfoes', () => {
      const existingState: StockState = {
        stockInfoes: [],
        stockInfo: { id: 1 }
      };
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
      const existingState: StockState = {
        stockInfoes: [],
        stockInfo: { id: 1 }
      };
      const payload = { id: 2 };
      const result = StockReducer(existingState, { type: GET_StockInfo, payload });

      expect(result.stockInfo).toEqual(payload);
    });

    test('preserves stockInfoes when updating stockInfo', () => {
      const existingState: StockState = {
        stockInfoes: [{ stockIdentifier: { id: 1 }, id: 10 }],
        stockInfo: {}
      };
      const payload = { id: 2 };
      const result = StockReducer(existingState, { type: GET_StockInfo, payload });

      expect(result.stockInfoes).toEqual([{ stockIdentifier: { id: 1 }, id: 10 }]);
    });
  });

  describe('SHIP_Stock', () => {
    test('removes shipped item from stockInfoes.result by stockIdentifier.id', () => {
      const existingState: StockState = {
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1, productNo: 'PROD001' } },
            { stockIdentifier: { id: 2, productNo: 'PROD002' } }
          ],
          otherData: 'preserved'
        } as StockInfoesWithResult,
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 1 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.result).toHaveLength(1);
      expect(stockInfoes.result[0].stockIdentifier?.id).toBe(2);
      expect(stockInfoes.otherData).toBe('preserved');
    });

    test('removes correct item when multiple items exist', () => {
      const existingState: StockState = {
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1 } },
            { stockIdentifier: { id: 2 } },
            { stockIdentifier: { id: 3 } }
          ]
        } as StockInfoesWithResult,
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 2 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.result).toHaveLength(2);
      expect(stockInfoes.result.map(s => s.stockIdentifier?.id)).toEqual([1, 3]);
    });

    test('handles payload that does not match any item', () => {
      const existingState: StockState = {
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1 } },
            { stockIdentifier: { id: 2 } }
          ]
        } as StockInfoesWithResult,
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 999 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.result).toHaveLength(2);
    });

    test('handles empty result array', () => {
      const existingState: StockState = {
        stockInfoes: { result: [] } as StockInfoesWithResult,
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 1 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.result).toEqual([]);
    });

    test('reduces the matching productList quantity and leaves other types', () => {
      const productList = [
        { type: '板卷', quantity: 10, unit: '碼' },
        { type: '整支', quantity: 2, unit: '支' }
      ];
      const existingState: StockState = {
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1, type: '板卷', quantity: 4, unit: '碼' } },
            { stockIdentifier: { id: 2, type: '板卷', quantity: 6, unit: '碼' } }
          ],
          productList
        } as StockInfoesWithResult,
        stockInfo: {}
      };

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
      const existingState: StockState = {
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 7, type: '板卷', quantity: 1.5, unit: '碼' } }
          ],
          productList: [{ type: '板卷', quantity: '10.00', unit: '碼' }]
        } as StockInfoesWithResult,
        stockInfo: {}
      };

      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 7 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.productList).toEqual([
        { type: '板卷', quantity: '8.50', unit: '碼' }
      ]);
    });

    test('filters stock-shaped productList rows by the shipped id', () => {
      const existingState: StockState = {
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1 } },
            { stockIdentifier: { id: 2 } }
          ],
          productList: [
            { stockIdentifier: { id: 1, productNo: 'A' } },
            { stockIdentifier: { id: 2, productNo: 'B' } }
          ]
        } as StockInfoesWithResult,
        stockInfo: {}
      };

      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 1 });
      const stockInfoes = result.stockInfoes as StockInfoesWithResult;

      expect(stockInfoes.productList).toEqual([
        { stockIdentifier: { id: 2, productNo: 'B' } }
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
    test('removes cancelled item from stockInfoes by stockIdentifier.id', () => {
      const existingState: StockState = {
        stockInfoes: [
          { stockIdentifier: { id: 1, productNo: 'PROD001' } },
          { stockIdentifier: { id: 2, productNo: 'PROD002' } }
        ] as StockInfo[],
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: CANCEL_SHRINK, payload: 1 });
      const stockInfoes = result.stockInfoes as StockInfo[];

      expect(stockInfoes).toHaveLength(1);
      expect(stockInfoes[0].stockIdentifier?.id).toBe(2);
    });

    test('removes correct item when multiple items exist', () => {
      const existingState: StockState = {
        stockInfoes: [
          { stockIdentifier: { id: 1 } },
          { stockIdentifier: { id: 2 } },
          { stockIdentifier: { id: 3 } }
        ] as StockInfo[],
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: CANCEL_SHRINK, payload: 2 });
      const stockInfoes = result.stockInfoes as StockInfo[];

      expect(stockInfoes).toHaveLength(2);
      expect(stockInfoes.map(s => s.stockIdentifier?.id)).toEqual([1, 3]);
    });

    test('handles payload that does not match any item', () => {
      const existingState: StockState = {
        stockInfoes: [
          { stockIdentifier: { id: 1 } },
          { stockIdentifier: { id: 2 } }
        ] as StockInfo[],
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: CANCEL_SHRINK, payload: 999 });
      const stockInfoes = result.stockInfoes as StockInfo[];

      expect(stockInfoes).toHaveLength(2);
    });

    test('handles empty stockInfoes array', () => {
      const result = StockReducer(initialState, { type: CANCEL_SHRINK, payload: 1 });
      expect(result.stockInfoes).toEqual([]);
    });
  });

  describe('UPDATE_StockInfo', () => {
    test('sets stockInfoes to payload', () => {
      const payload = { result: [{ id: 3 }] };
      const result = StockReducer(initialState, { type: UPDATE_StockInfo, payload });

      expect(result.stockInfoes).toEqual(payload);
    });

    test('replaces existing stockInfoes', () => {
      const existingState: StockState = {
        stockInfoes: [{ stockIdentifier: { id: 1 }, id: 1 }],
        stockInfo: {}
      };
      const payload = [{ id: 2, remark: 'updated' }];
      const result = StockReducer(existingState, { type: UPDATE_StockInfo, payload });

      expect(result.stockInfoes).toEqual(payload);
    });
  });

  describe('state immutability', () => {
    test('does not mutate original state', () => {
      const originalState: StockState = {
        stockInfoes: [{ stockIdentifier: { id: 1 }, id: 1 }],
        stockInfo: { id: 5 }
      };
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      StockReducer(originalState, { type: GET_Order, payload: [{ id: 2 }] });

      expect(originalState).toEqual(stateCopy);
    });
  });
});
