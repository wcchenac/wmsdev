import axios from "axios";

/**
 * Resolve the API origin used by axios.
 *
 * Order:
 * 1. window.__WMS_CONFIG__.apiBaseUrl written at container start (docker/frontend)
 * 2. REACT_APP_API_BASE_URL baked in at build time (.env.local for npm start)
 * 3. "/" so requests stay on this origin and a reverse proxy can forward /api
 *
 * A trailing-slash-free absolute URL such as http://192.168.20.113:8080 still
 * works. "/" is required when the value is same-origin: axios only joins a
 * relative path like "api/file/..." when baseURL is truthy.
 */
function resolveApiBaseUrl() {
  const runtimeConfig =
    typeof window !== "undefined" ? window.__WMS_CONFIG__ : undefined;
  const runtimeBase =
    runtimeConfig && typeof runtimeConfig.apiBaseUrl === "string"
      ? runtimeConfig.apiBaseUrl.trim()
      : "";

  if (runtimeBase) {
    return runtimeBase;
  }

  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  return "/";
}

export default axios.create({
  baseURL: resolveApiBaseUrl(),
  responseEncoding: "utf8",
});
