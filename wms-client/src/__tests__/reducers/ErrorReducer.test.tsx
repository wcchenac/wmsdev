import ErrorReducer from '../../reducers/ErrorReducer';
import {
  GET_Errors,
  CREATE_Errors,
  SHRINK_Errors,
  UPDATE_Errors
} from '../../types';
import type { ErrorState } from '../../types';

type ErrorAction = Parameters<typeof ErrorReducer>[1];

// The tests set only the slices they look at.
const partialState = (state: Partial<ErrorState>): ErrorState => state as ErrorState;

describe('ErrorReducer', () => {
  const initialState: ErrorState = {
    errors: null,
    createErrors: null,
    shrinkErrors: null,
    updateErrors: null
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
      const existingState = partialState({
        errors: { old: 'error' }
      });
      const payload = { new: 'error' };
      const result = ErrorReducer(existingState, { type: GET_Errors, payload });

      expect(result.errors).toEqual(payload);
    });

    test('preserves other error types when setting GET_Errors', () => {
      const existingState = partialState({
        createErrors: { field: 'create error' },
        shrinkErrors: { field: 'shrink error' }
      });
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
      const existingState = partialState({
        createErrors: { old: 'error' }
      });
      const payload = { new: 'error' };
      const result = ErrorReducer(existingState, { type: CREATE_Errors, payload });

      expect(result.createErrors).toEqual(payload);
    });

    test('preserves other error types when setting CREATE_Errors', () => {
      const existingState = partialState({
        errors: { field: 'get error' },
        shrinkErrors: { field: 'shrink error' }
      });
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
      const existingState = partialState({
        shrinkErrors: { old: 'error' }
      });
      const payload = { new: 'error' };
      const result = ErrorReducer(existingState, { type: SHRINK_Errors, payload });

      expect(result.shrinkErrors).toEqual(payload);
    });

    test('preserves other error types when setting SHRINK_Errors', () => {
      const existingState = partialState({
        errors: { field: 'get error' },
        createErrors: { field: 'create error' }
      });
      const payload = { message: 'shrink error' };
      const result = ErrorReducer(existingState, { type: SHRINK_Errors, payload });

      expect(result.shrinkErrors).toEqual(payload);
      expect(result.errors).toEqual({ field: 'get error' });
      expect(result.createErrors).toEqual({ field: 'create error' });
    });
  });

  describe('UPDATE_Errors', () => {
    test('stores the payload on updateErrors and leaves the other fields', () => {
      const existingState: ErrorState = {
        errors: { field: 'get error' },
        createErrors: { field: 'create error' },
        shrinkErrors: { field: 'shrink error' },
        updateErrors: null
      };
      const payload = { message: '更新庫存資訊失敗' };
      const result = ErrorReducer(existingState, { type: UPDATE_Errors, payload });

      expect(result.updateErrors).toEqual(payload);
      expect(result.errors).toEqual({ field: 'get error' });
      expect(result.createErrors).toEqual({ field: 'create error' });
      expect(result.shrinkErrors).toEqual({ field: 'shrink error' });
    });

    test('replaces an existing updateErrors payload', () => {
      const existingState = partialState({
        ...initialState,
        updateErrors: { old: 'error' }
      });
      const payload = { message: '更新失敗' };
      const result = ErrorReducer(existingState, { type: UPDATE_Errors, payload });

      expect(result.updateErrors).toEqual(payload);
    });

    test('stores null when the payload is null', () => {
      const existingState = partialState({
        ...initialState,
        updateErrors: { old: 'error' }
      });
      const result = ErrorReducer(existingState, { type: UPDATE_Errors, payload: null });

      expect(result.updateErrors).toBeNull();
    });
  });

  describe('multiple error types', () => {
    test('can hold get, create, shrink, and update errors at once', () => {
      let state: ErrorState = initialState;
      state = ErrorReducer(state, { type: GET_Errors, payload: { get: 'error' } });
      state = ErrorReducer(state, { type: CREATE_Errors, payload: { create: 'error' } });
      state = ErrorReducer(state, { type: SHRINK_Errors, payload: { shrink: 'error' } });
      state = ErrorReducer(state, { type: UPDATE_Errors, payload: { update: 'error' } });

      expect(state.errors).toEqual({ get: 'error' });
      expect(state.createErrors).toEqual({ create: 'error' });
      expect(state.shrinkErrors).toEqual({ shrink: 'error' });
      expect(state.updateErrors).toEqual({ update: 'error' });
    });
  });

  describe('state immutability', () => {
    test('does not mutate original state', () => {
      const originalState = partialState({
        errors: { existing: 'error' }
      });
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      ErrorReducer(originalState, { type: GET_Errors, payload: { new: 'error' } });

      expect(originalState).toEqual(stateCopy);
    });
  });
});
