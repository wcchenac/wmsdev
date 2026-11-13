# wms-client

React client for the warehouse tool. Use Node.js 22 or later. The build uses Vite 6 and tests run on Vitest 3.

```bash
npm install
npm start              # Vite dev server on http://localhost:3000
npm test               # Vitest, single run (npm run test:watch to watch)
npm run lint
npm run build          # type-check (tsconfig.app.json) + vite build into build/
npm run preview        # serve build/ locally
npm run storybook
npm run build-storybook
```

TypeScript runs side by side, as the TypeScript 7 release notes recommend for tools that still need the compiler API. `tsc` (type-checking in `npm run build`) is TypeScript 7 from the `@typescript/native` alias. The `typescript` package is the TypeScript 6 API (`@typescript/typescript6`, which also ships `tsc6`), because typescript-eslint does not support TypeScript 7 yet ([typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)). Do not point `typescript` at 7.x until typescript-eslint supports it.

`npm run storybook` opens the component workshop at http://localhost:6006. Stories run on @storybook/react-vite and use the same React 19, MUI 9, React Router 7, and Redux setup as the app.

API calls go through `src/utilities/API.ts`. The base URL is `window.__WMS_CONFIG__.apiBaseUrl` when that file is set, otherwise `VITE_API_BASE_URL` or `REACT_APP_API_BASE_URL`, otherwise `/` so a reverse proxy can forward `/api`. For `npm start` against the LAN Spring Boot service, put this in `wms-client/.env.local` (gitignored):

```bash
REACT_APP_API_BASE_URL=http://192.168.20.113:8080
```

Docker Compose for a reviewable frontend plus mock API is documented in `docker/README.md`.
