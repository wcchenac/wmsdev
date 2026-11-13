import ErrorReducer from '../../reducers/ErrorReducer';
import {
  GET_Errors,
  CREATE_Errors,
  SHRINK_Errors
} from '../../types';

interface ErrorState {
  errors?: Record<string, string> | null;
  createErrors?: Record<string, string>;
  shrinkErrors?: Record<string, string>;
}

interface ErrorAction {
  type: string;
  payload?: Record<string, string> | null;
}

describe('ErrorReducer', () => {
  const initialState: ErrorState = {
    errors: null,
    createErrors: null,
    shrinkErrors: null
  };

  describe('initial state', () => {
    test('returns initial state when no state provided', () => {
      expect(ErrorReducer(undefined, {} as ErrorAction)).toEqual(initialState);
    });

    test('returns initial state for unknown action type', () => {
      expect(ErrorReducer(initialState, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
    });
  });

  describe('GET_Errors', () => {
    test('sets errors to payload', () => {
      const payload = { message: 'General error occurred' };
      const result = ErrorReducer(initialState, { type: GET_Errors, payload });

      expect(result.errors).toEqual(payload);
    });

    test('handles error with multiple fields', () => {
      const payload = {
        employeeId: 'Invalid employee ID',
        password: 'Password is required'
      };
      const result = ErrorReducer(initialState, { type: GET_Errors, payload });

      expect(result.errors).toEqual(payload);
    });

    test('replaces existing errors', () => {
      const existingState: ErrorState = {
        errors: { old: 'error' }
      };
      const payload = { new: 'error' };
      const result = ErrorReducer(existingState, { type: GET_Errors, payload });

      expect(result.errors).toEqual(payload);
    });

    test('preserves other error types when setting GET_Errors', () => {
      const existingState: ErrorState = {
        createErrors: { field: 'create error' },
        shrinkErrors: { field: 'shrink error' }
      };
      const payload = { message: 'get error' };
      const result = ErrorReducer(existingState, { type: GET_Errors, payload });

      expect(result.errors).toEqual(payload);
      expect(result.createErrors).toEqual({ field: 'create error' });
      expect(result.shrinkErrors).toEqual({ field: 'shrink error' });
    });

    test('handles null payload', () => {
      const result = ErrorReducer(initialState, { type: GET_Errors, payload: null });
      expect(result.errors).toBeNull();
    });

    test('handles empty object payload', () => {
      const result = ErrorReducer(initialState, { type: GET_Errors, payload: {} });
      expect(result.errors).toEqual({});
    });
  });

  describe('CREATE_Errors', () => {
    test('sets createErrors to payload', () => {
      const payload = { message: 'Create operation failed' };
      const result = ErrorReducer(initialState, { type: CREATE_Errors, payload });

      expect(result.createErrors).toEqual(payload);
    });

    test('handles create error with validation messages', () => {
      const payload = {
        quantity: 'Invalid quantity format',
        productNo: 'Product not found'
      };
      const result = ErrorReducer(initialState, { type: CREATE_Errors, payload });

      expect(result.createErrors).toEqual(payload);
    });

    test('replaces existing createErrors', () => {
      const existingState: ErrorState = {
        createErrors: { old: 'error' }
      };
      const payload = { new: 'error' };
      const result = ErrorReducer(existingState, { type: CREATE_Errors, payload });

      expect(result.createErrors).toEqual(payload);
    });

    test('preserves other error types when setting CREATE_Errors', () => {
      const existingState: ErrorState = {
        errors: { field: 'get error' },
        shrinkErrors: { field: 'shrink error' }
      };
      const payload = { message: 'create error' };
      const result = ErrorReducer(existingState, { type: CREATE_Errors, payload });

      expect(result.createErrors).toEqual(payload);
      expect(result.errors).toEqual({ field: 'get error' });
      expect(result.shrinkErrors).toEqual({ field: 'shrink error' });
    });
  });

  describe('SHRINK_Errors', () => {
    test('sets shrinkErrors to payload', () => {
      const payload = { message: 'Shrink operation failed' };
      const result = ErrorReducer(initialState, { type: SHRINK_Errors, payload });

      expect(result.shrinkErrors).toEqual(payload);
    });

    test('handles shrink error with specific field errors', () => {
      const payload = {
        quantity: 'Quantity exceeds available stock',
        shrinkType: 'Invalid shrink type'
      };
      const result = ErrorReducer(initialState, { type: SHRINK_Errors, payload });

      expect(result.shrinkErrors).toEqual(payload);
    });

    test('replaces existing shrinkErrors', () => {
      const existingState: ErrorState = {
        shrinkErrors: { old: 'error' }
      };
      const payload = { new: 'error' };
      const result = ErrorReducer(existingState, { type: SHRINK_Errors, payload });

      expect(result.shrinkErrors).toEqual(payload);
    });

    test('preserves other error types when setting SHRINK_Errors', () => {
      const existingState: ErrorState = {
        errors: { field: 'get error' },
        createErrors: { field: 'create error' }
      };
      const payload = { message: 'shrink error' };
      const result = ErrorReducer(existingState, { type: SHRINK_Errors, payload });

      expect(result.shrinkErrors).toEqual(payload);
      expect(result.errors).toEqual({ field: 'get error' });
      expect(result.createErrors).toEqual({ field: 'create error' });
    });
  });

  describe('multiple error types', () => {
    test('can have all three error types simultaneously', () => {
      let state: ErrorState = initialState;
      state = ErrorReducer(state, { type: GET_Errors, payload: { get: 'error' } });
      state = ErrorReducer(state, { type: CREATE_Errors, payload: { create: 'error' } });
      state = ErrorReducer(state, { type: SHRINK_Errors, payload: { shrink: 'error' } });

      expect(state.errors).toEqual({ get: 'error' });
      expect(state.createErrors).toEqual({ create: 'error' });
      expect(state.shrinkErrors).toEqual({ shrink: 'error' });
    });
  });

  describe('state immutability', () => {
    test('does not mutate original state', () => {
      const originalState: ErrorState = {
        errors: { existing: 'error' }
      };
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      ErrorReducer(originalState, { type: GET_Errors, payload: { new: 'error' } });

      expect(originalState).toEqual(stateCopy);
    });
  });
});
