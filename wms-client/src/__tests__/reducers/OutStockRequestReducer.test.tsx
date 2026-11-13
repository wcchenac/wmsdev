import OutStockRequestReducer from '../../reducers/OutStockRequestReducer';
import { GET_OutStockRequests } from '../../types';

interface OutStockRequestState {
  outStockRequests: unknown;
}

interface OutStockRequestAction {
  type: string;
  payload?: unknown;
}

describe('OutStockRequestReducer', () => {
  const initialState: OutStockRequestState = {
    outStockRequests: {}
  };

  describe('initial state', () => {
    test('returns initial state when no state provided', () => {
      expect(OutStockRequestReducer(undefined, {} as OutStockRequestAction)).toEqual(initialState);
    });

    test('returns initial state for unknown action type', () => {
      expect(OutStockRequestReducer(initialState, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
    });
  });

  describe('GET_OutStockRequests', () => {
    test('sets outStockRequests to payload', () => {
      const payload = {
        requests: [
          { id: 1, reason: '中壢' },
          { id: 2, reason: '新竹' }
        ]
      };
      const result = OutStockRequestReducer(initialState, { type: GET_OutStockRequests, payload });

      expect(result.outStockRequests).toEqual(payload);
    });

    test('handles payload with query result structure', () => {
      const payload = {
        queryResult: {
          'PROD001': [{ id: 1, quantity: '10' }],
          'PROD002': [{ id: 2, quantity: '5' }]
        },
        userList: ['user1', 'user2']
      };
      const result = OutStockRequestReducer(initialState, { type: GET_OutStockRequests, payload });
      const outStockRequests = result.outStockRequests as typeof payload;

      expect(result.outStockRequests).toEqual(payload);
      expect(outStockRequests.queryResult).toHaveProperty('PROD001');
      expect(outStockRequests.userList).toHaveLength(2);
    });

    test('replaces existing outStockRequests', () => {
      const existingState: OutStockRequestState = {
        outStockRequests: { old: 'data' }
      };
      const payload = { new: 'data' };
      const result = OutStockRequestReducer(existingState, { type: GET_OutStockRequests, payload });

      expect(result.outStockRequests).toEqual(payload);
    });

    test('handles empty object payload', () => {
      const result = OutStockRequestReducer(initialState, { type: GET_OutStockRequests, payload: {} });
      expect(result.outStockRequests).toEqual({});
    });

    test('handles empty array payload', () => {
      const result = OutStockRequestReducer(initialState, { type: GET_OutStockRequests, payload: [] });
      expect(result.outStockRequests).toEqual([]);
    });

    test('handles null payload (defaults to empty object)', () => {
      const result = OutStockRequestReducer(initialState, { type: GET_OutStockRequests, payload: null });
      expect(result.outStockRequests).toEqual({});
    });
  });

  describe('state immutability', () => {
    test('does not mutate original state', () => {
      const originalState: OutStockRequestState = {
        outStockRequests: { existing: 'data' }
      };
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      OutStockRequestReducer(originalState, { type: GET_OutStockRequests, payload: { new: 'data' } });

      expect(originalState).toEqual(stateCopy);
    });
  });
});
