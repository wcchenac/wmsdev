// React 18 createRoot updates must run in an act environment under Jest.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
