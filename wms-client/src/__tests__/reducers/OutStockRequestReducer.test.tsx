import OutStockRequestReducer from '../../reducers/OutStockRequestReducer';
import { GET_OutStockRequests } from '../../types';
import type { OutStockRequestState } from '../../types';

type OutStockRequestAction = Parameters<typeof OutStockRequestReducer>[1];

// For the tests that check how the reducer copes with a payload of the wrong type.
const getOutStockRequestsWith = (payload: unknown): OutStockRequestAction =>
  ({ type: GET_OutStockRequests, payload }) as OutStockRequestAction;

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
        queryResult: {
          '2024-01-01': [
            { id: 1, reason: '中壢' },
            { id: 2, reason: '新竹' }
          ]
        }
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
        outStockRequests: { userList: ['old'] }
      };
      const payload = { userList: ['new'] };
      const result = OutStockRequestReducer(existingState, { type: GET_OutStockRequests, payload });

      expect(result.outStockRequests).toEqual(payload);
    });

    test('handles empty object payload', () => {
      const result = OutStockRequestReducer(initialState, { type: GET_OutStockRequests, payload: {} });
      expect(result.outStockRequests).toEqual({});
    });

    test('handles empty array payload', () => {
      const result = OutStockRequestReducer(initialState, getOutStockRequestsWith([]));
      expect(result.outStockRequests).toEqual([]);
    });

    test('handles null payload (defaults to empty object)', () => {
      const result = OutStockRequestReducer(initialState, getOutStockRequestsWith(null));
      expect(result.outStockRequests).toEqual({});
    });
  });

  describe('state immutability', () => {
    test('does not mutate original state', () => {
      const originalState: OutStockRequestState = {
        outStockRequests: { userList: ['existing'] }
      };
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      OutStockRequestReducer(originalState, { type: GET_OutStockRequests, payload: { userList: ['new'] } });

      expect(originalState).toEqual(stateCopy);
    });
  });
});
