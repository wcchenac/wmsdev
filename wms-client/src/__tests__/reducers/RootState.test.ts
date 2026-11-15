import { createStore } from 'redux';
import rootReducer from '../../reducers';
import type { RootState } from '../../reducers';
import type { RootState as RootStateFromStore } from '../../store';
import type { RootState as RootStateFromTypes } from '../../types';
import { CREATE_FILE, UPDATE_Errors } from '../../types';

const reducerKeys = ['errors', 'fileName', 'outStockRequests', 'stockInfo', 'user'];

describe('RootState', () => {
  test('matches the combined reducer keys, with fileName rather than files', () => {
    const state = createStore(rootReducer).getState();

    expect(Object.keys(state).sort()).toEqual([...reducerKeys].sort());
    expect(state).not.toHaveProperty('files');
    expect(state.fileName).toEqual({ isLoading: false, lastOperation: null });
    expect(state.errors).toEqual({
      errors: null,
      createErrors: null,
      shrinkErrors: null,
      updateErrors: null
    });

    const fromReducers: RootState = state;
    const fromStore: RootStateFromStore = fromReducers;
    const fromTypes: RootStateFromTypes = fromStore;
    expect(fromTypes.fileName.isLoading).toBe(false);
  });

  test('UPDATE_Errors is kept on errors.updateErrors', () => {
    const store = createStore(rootReducer);
    store.dispatch({ type: UPDATE_Errors, payload: { message: '更新庫存資訊失敗' } });

    expect(store.getState().errors.updateErrors).toEqual({ message: '更新庫存資訊失敗' });
    expect(store.getState().errors.errors).toBeNull();
  });

  test('CREATE_FILE payload false resets fileName.isLoading', () => {
    const store = createStore(rootReducer);
    store.dispatch({ type: CREATE_FILE });
    expect(store.getState().fileName.isLoading).toBe(true);

    store.dispatch({ type: CREATE_FILE, payload: false });
    expect(store.getState().fileName).toEqual({ isLoading: false, lastOperation: 'create' });
  });
});
