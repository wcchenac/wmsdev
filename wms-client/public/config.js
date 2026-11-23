// Default for builds served without the frontend container: apiBaseUrl is left unset, so
// API.ts falls back to the URL baked in at build time (VITE_/REACT_APP_API_BASE_URL) or "/".
// The frontend container rewrites this file from API_BASE_URL; there an empty apiBaseUrl means
// "call /api on the same origin" (nginx proxy) and overrides any build-time URL.
window.__WMS_CONFIG__ = window.__WMS_CONFIG__ || {};
