/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { devApiProxy } from "./src/utilities/devApiProxy";

export default defineConfig(({ mode }) => {
  // VITE_API_PROXY_TARGET may come from the shell or from .env / .env.local.
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), "VITE_") };

  return {
    plugins: [react()],
    // Keep the CRA-era REACT_APP_ prefix so existing .env files and the Docker
    // build arg (REACT_APP_API_BASE_URL) keep working.
    envPrefix: ["VITE_", "REACT_APP_"],
    server: {
      port: 3000,
      // API.ts calls "/api" on the same origin when no API base URL is set.
      proxy: devApiProxy(env),
    },
    preview: {
      port: 3000,
      proxy: devApiProxy(env),
    },
    build: {
      // docker/frontend/Dockerfile copies /app/build into nginx.
      outDir: "build",
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"],
      css: false,
      server: {
        deps: {
          // react-loader-spinner 8's CJS build reads styled-components' default
          // export wrongly under Node; let Vite transform its ESM build instead.
          inline: ["react-loader-spinner"],
        },
      },
    },
  };
});
