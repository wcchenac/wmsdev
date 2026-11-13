import type { ProxyOptions } from "vite";

/** Backend that `npm start` / `npm run preview` forward /api to when nothing else is set. */
export const DEFAULT_API_PROXY_TARGET = "http://localhost:8080";

/**
 * /api proxy for the Vite dev and preview servers (used by vite.config.ts, not by the app).
 *
 * API.ts falls back to "/" when no API base URL is configured, so without this a fresh clone
 * running `npm start` would send every /api call to Vite itself. Set VITE_API_PROXY_TARGET to
 * use another backend; setting VITE_API_BASE_URL / REACT_APP_API_BASE_URL instead makes the
 * app call that host directly and bypasses the proxy.
 */
export function devApiProxy(env: Record<string, string | undefined> = process.env): Record<string, ProxyOptions> {
  return {
    "/api": {
      target: env.VITE_API_PROXY_TARGET || DEFAULT_API_PROXY_TARGET,
      changeOrigin: true,
    },
  };
}
