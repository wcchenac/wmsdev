/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Keep the CRA-era REACT_APP_ prefix so existing .env files and the Docker
  // build arg (REACT_APP_API_BASE_URL) keep working.
  envPrefix: ["VITE_", "REACT_APP_"],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
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
});
