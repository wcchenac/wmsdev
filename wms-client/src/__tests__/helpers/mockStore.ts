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
 * The state a test may give: any subset of the app's slices (a misspelled slice name, such as
 * `files` for `fileName`, is a type error), with whatever part of each slice the code under
 * test reads, so the slice contents are not checked.
 */
export type MockStoreState = { [K in keyof RootState]?: unknown };

/** Creates a mock store with the thunk middleware. */
export const createMockStore = (state: MockStoreState = {}): TestMockStore =>
  mockStoreCreator(state as RootState);
