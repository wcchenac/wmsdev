import FileReducer from '../../reducers/FileReducer';
import { CREATE_FILE } from '../../types';

interface FileState {
  isLoading: boolean;
  lastOperation: string | null;
}

interface FileAction {
  type: string;
  payload?: unknown;
}

describe('FileReducer', () => {
  const initialState: FileState = {
    isLoading: false,
    lastOperation: null
  };

  describe('initial state', () => {
    test('returns initial state when no state provided', () => {
      expect(FileReducer(undefined, {} as FileAction)).toEqual(initialState);
    });

    test('returns initial state for unknown action type', () => {
      expect(FileReducer(initialState, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
    });
  });

  describe('CREATE_FILE', () => {
    test('sets isLoading to true and lastOperation to create', () => {
      const result = FileReducer(initialState, { type: CREATE_FILE });
      expect(result.isLoading).toBe(true);
      expect(result.lastOperation).toBe('create');
    });

    test('updates existing state with loading flag', () => {
      const existingState: FileState = { isLoading: false, lastOperation: null };
      const result = FileReducer(existingState, { type: CREATE_FILE });
      expect(result.isLoading).toBe(true);
      expect(result.lastOperation).toBe('create');
    });

    test('creates new object (immutability)', () => {
      const existingState: FileState = { isLoading: false, lastOperation: null };
      const result = FileReducer(existingState, { type: CREATE_FILE });
      expect(result).not.toBe(existingState);
    });
  });

  describe('state immutability', () => {
    test('does not mutate original state', () => {
      const originalState: FileState = { isLoading: false, lastOperation: null };
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      FileReducer(originalState, { type: CREATE_FILE });

      expect(originalState).toEqual(stateCopy);
    });
  });
});
