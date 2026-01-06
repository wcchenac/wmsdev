import FileReducer from '../../reducers/FileReducer';
import { CREATE_FILE } from '../../actions/types';

describe('FileReducer', () => {
  const initialState = {};

  describe('initial state', () => {
    test('returns initial state when no state provided', () => {
      expect(FileReducer(undefined, {})).toEqual(initialState);
    });

    test('returns initial state for unknown action type', () => {
      expect(FileReducer(initialState, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
    });
  });

  describe('CREATE_FILE', () => {
    test('returns same state (no-op action)', () => {
      const result = FileReducer(initialState, { type: CREATE_FILE });
      expect(result).toEqual(initialState);
    });

    test('returns existing state unchanged', () => {
      const existingState = { someData: 'value' };
      const result = FileReducer(existingState, { type: CREATE_FILE });
      expect(result).toEqual(existingState);
    });

    test('ignores payload completely', () => {
      const existingState = { original: 'data' };
      const result = FileReducer(existingState, { type: CREATE_FILE, payload: { new: 'data' } });
      expect(result).toEqual(existingState);
    });

    test('returns same reference (no new object created)', () => {
      const existingState = { data: 'test' };
      const result = FileReducer(existingState, { type: CREATE_FILE });
      expect(result).toBe(existingState);
    });
  });

  describe('state immutability', () => {
    test('does not mutate original state', () => {
      const originalState = { existing: 'data' };
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      FileReducer(originalState, { type: CREATE_FILE, payload: { new: 'data' } });

      expect(originalState).toEqual(stateCopy);
    });
  });
});
