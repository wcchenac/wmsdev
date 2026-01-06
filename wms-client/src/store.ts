import { createStore, applyMiddleware, compose, StoreEnhancer, Reducer } from "redux";
import { thunk, ThunkMiddleware } from "redux-thunk";
import rootReducer from "./reducers";

/**
 * Redux Store Configuration
 * - Uses Redux Thunk middleware for async actions
 * - Enables Redux DevTools in development mode
 */

// Infer the RootState type from rootReducer
export type RootState = ReturnType<typeof rootReducer>;

// Define AppDispatch type for thunk actions
export type AppDispatch = typeof store.dispatch;

// Type for Redux DevTools Extension
interface DevToolsExtension {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: (options?: {
    trace?: boolean;
    traceLimit?: number;
  }) => typeof compose;
}

const initialState = {};
const middleware: ThunkMiddleware<RootState>[] = [thunk];

// Enable Redux DevTools Extension in development
const composeEnhancers: typeof compose =
  process.env.NODE_ENV === 'development' &&
  typeof window !== 'undefined' &&
  (window as unknown as DevToolsExtension).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as unknown as DevToolsExtension).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__!({
        // Options for DevTools
        trace: true,
        traceLimit: 25,
      })
    : compose;

const store = createStore(
  rootReducer as Reducer<RootState>,
  initialState,
  composeEnhancers(applyMiddleware(...middleware)) as StoreEnhancer
);

export default store;
