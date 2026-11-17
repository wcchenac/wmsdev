import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import type { AppDispatch, RootState } from '../../types';

// redux-mock-store's typings predate Redux 5 / redux-thunk 3: its middleware type rejects
// `thunk`, and a store typed with a local state/dispatch rejects the app's thunks, whose
// dispatch is the real AppDispatch. This store is typed with the app's own RootState and
// AppDispatch, so `store.dispatch(someThunk())` type-checks like it does in the app.

/** A mock store whose dispatch accepts the app's thunks. */
export type TestMockStore = MockStoreEnhanced<RootState, AppDispatch>;

// Its Middleware type comes from the older redux that @types/redux-mock-store depends on.
type MockStoreMiddleware = NonNullable<Parameters<typeof configureMockStore>[0]>[number];

const mockStoreCreator = configureMockStore<RootState, AppDispatch>([thunk as unknown as MockStoreMiddleware]);

/**
 * Creates a mock store with the thunk middleware. Tests usually give only the slices the
 * code under test reads, so any partial state is accepted.
 */
export const createMockStore = (state: object = {}): TestMockStore =>
  mockStoreCreator(state as RootState);
