import { createStore, applyMiddleware, compose } from "redux";
import { thunk } from "redux-thunk";
import rootReducer from "./reducers";

/**
 * Redux Store Configuration
 * - Uses Redux Thunk middleware for async actions
 * - Enables Redux DevTools in development mode
 */

// The Redux DevTools browser extension adds this to window.
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: (options?: {
      trace?: boolean;
      traceLimit?: number;
    }) => typeof compose;
  }
}

// Infer the RootState type from rootReducer
export type RootState = ReturnType<typeof rootReducer>;

// Define AppDispatch type for thunk actions
export type AppDispatch = typeof store.dispatch;

// Enable Redux DevTools Extension in development
const devToolsCompose =
  import.meta.env.DEV && typeof window !== "undefined"
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : undefined;

const composeEnhancers: typeof compose = devToolsCompose
  ? devToolsCompose({
      // Options for DevTools
      trace: true,
      traceLimit: 25,
    })
  : compose;

// No preloaded state: each reducer starts from its own initial state.
// applyMiddleware(thunk) types store.dispatch so it also accepts thunks.
const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

export default store;
