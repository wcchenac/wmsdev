/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_API_BASE_URL?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declare modules without types
declare module 'react-loading-overlay-ts';
declare module 'react-promise-tracker';
declare module 'react-loader-spinner';
declare module 'fast-deep-equal';
