import StockReducer from '../../reducers/StockReducer';
import {
  GET_Order,
  GET_StockInfo,
  GET_StockInfoes,
  SHIP_Stock,
  SHIP_Stocks,
  SHRINK_Stock,
  CANCEL_SHRINK,
  UPDATE_StockInfo
} from '../../actions/types';

describe('StockReducer', () => {
  const initialState = {
    stockInfoes: [],
    stockInfo: {}
  };

  describe('initial state', () => {
    test('returns initial state when no state provided', () => {
      expect(StockReducer(undefined, {})).toEqual(initialState);
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
      const existingState = {
        stockInfoes: [{ id: 'old' }],
        stockInfo: {}
      };
      const payload = [{ id: 'new' }];
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
      const result = StockReducer(initialState, { type: GET_Order, payload });
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
      const existingState = {
        stockInfoes: [],
        stockInfo: { id: 'existing' }
      };
      const payload = [{ id: 'new' }];
      const result = StockReducer(existingState, { type: GET_StockInfoes, payload });

      expect(result.stockInfo).toEqual({ id: 'existing' });
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
      const existingState = {
        stockInfoes: [],
        stockInfo: { id: 'old' }
      };
      const payload = { id: 'new' };
      const result = StockReducer(existingState, { type: GET_StockInfo, payload });

      expect(result.stockInfo).toEqual(payload);
    });

    test('preserves stockInfoes when updating stockInfo', () => {
      const existingState = {
        stockInfoes: [{ id: 'existing' }],
        stockInfo: {}
      };
      const payload = { id: 'new' };
      const result = StockReducer(existingState, { type: GET_StockInfo, payload });

      expect(result.stockInfoes).toEqual([{ id: 'existing' }]);
    });
  });

  describe('SHIP_Stock', () => {
    test('removes shipped item from stockInfoes.result by stockIdentifier.id', () => {
      const existingState = {
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1 }, productNo: 'PROD001' },
            { stockIdentifier: { id: 2 }, productNo: 'PROD002' }
          ],
          otherData: 'preserved'
        },
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 1 });

      expect(result.stockInfoes.result).toHaveLength(1);
      expect(result.stockInfoes.result[0].stockIdentifier.id).toBe(2);
      expect(result.stockInfoes.otherData).toBe('preserved');
    });

    test('removes correct item when multiple items exist', () => {
      const existingState = {
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1 } },
            { stockIdentifier: { id: 2 } },
            { stockIdentifier: { id: 3 } }
          ]
        },
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 2 });

      expect(result.stockInfoes.result).toHaveLength(2);
      expect(result.stockInfoes.result.map(s => s.stockIdentifier.id)).toEqual([1, 3]);
    });

    test('handles payload that does not match any item', () => {
      const existingState = {
        stockInfoes: {
          result: [
            { stockIdentifier: { id: 1 } },
            { stockIdentifier: { id: 2 } }
          ]
        },
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 999 });

      expect(result.stockInfoes.result).toHaveLength(2);
    });

    test('handles empty result array', () => {
      const existingState = {
        stockInfoes: { result: [] },
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: SHIP_Stock, payload: 1 });

      expect(result.stockInfoes.result).toEqual([]);
    });
  });

  describe('SHIP_Stocks', () => {
    test('sets stockInfoes to payload', () => {
      const payload = { result: [{ id: 'updated' }] };
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
      const existingState = {
        stockInfoes: [
          { stockIdentifier: { id: 1 }, productNo: 'PROD001' },
          { stockIdentifier: { id: 2 }, productNo: 'PROD002' }
        ],
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: CANCEL_SHRINK, payload: 1 });

      expect(result.stockInfoes).toHaveLength(1);
      expect(result.stockInfoes[0].stockIdentifier.id).toBe(2);
    });

    test('removes correct item when multiple items exist', () => {
      const existingState = {
        stockInfoes: [
          { stockIdentifier: { id: 1 } },
          { stockIdentifier: { id: 2 } },
          { stockIdentifier: { id: 3 } }
        ],
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: CANCEL_SHRINK, payload: 2 });

      expect(result.stockInfoes).toHaveLength(2);
      expect(result.stockInfoes.map(s => s.stockIdentifier.id)).toEqual([1, 3]);
    });

    test('handles payload that does not match any item', () => {
      const existingState = {
        stockInfoes: [
          { stockIdentifier: { id: 1 } },
          { stockIdentifier: { id: 2 } }
        ],
        stockInfo: {}
      };
      const result = StockReducer(existingState, { type: CANCEL_SHRINK, payload: 999 });

      expect(result.stockInfoes).toHaveLength(2);
    });

    test('handles empty stockInfoes array', () => {
      const result = StockReducer(initialState, { type: CANCEL_SHRINK, payload: 1 });
      expect(result.stockInfoes).toEqual([]);
    });
  });

  describe('UPDATE_StockInfo', () => {
    test('sets stockInfoes to payload', () => {
      const payload = { result: [{ id: 'updated' }] };
      const result = StockReducer(initialState, { type: UPDATE_StockInfo, payload });

      expect(result.stockInfoes).toEqual(payload);
    });

    test('replaces existing stockInfoes', () => {
      const existingState = {
        stockInfoes: [{ id: 'old' }],
        stockInfo: {}
      };
      const payload = [{ id: 'new', updated: true }];
      const result = StockReducer(existingState, { type: UPDATE_StockInfo, payload });

      expect(result.stockInfoes).toEqual(payload);
    });
  });

  describe('state immutability', () => {
    test('does not mutate original state', () => {
      const originalState = {
        stockInfoes: [{ id: 1 }],
        stockInfo: { id: 'info' }
      };
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      StockReducer(originalState, { type: GET_Order, payload: [{ id: 2 }] });

      expect(originalState).toEqual(stateCopy);
    });
  });
});
