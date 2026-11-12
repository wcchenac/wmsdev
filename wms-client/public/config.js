// Default for local builds. The frontend container rewrites this file from API_BASE_URL.
// Leave apiBaseUrl empty to call /api on the same origin (nginx proxy or an absolute override).
window.__WMS_CONFIG__ = window.__WMS_CONFIG__ || { apiBaseUrl: "" };
