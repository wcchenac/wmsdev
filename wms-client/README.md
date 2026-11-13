# wms-client

React client for the warehouse tool. Use Node.js 20 with Create React App 5.

```bash
npm install
npm start
npm test -- --watchAll=false
npm run build
npm run storybook
npm run build-storybook
```

`npm run storybook` opens the component workshop at http://localhost:6006. Stories use the React 18 app, Material-UI 4, and React Router 5.

API calls go through `src/utilities/API.js`. The base URL is `window.__WMS_CONFIG__.apiBaseUrl` when that file is set, otherwise `REACT_APP_API_BASE_URL`, otherwise `/` so a reverse proxy can forward `/api`. For `npm start` against the LAN Spring Boot service, put this in `wms-client/.env.local` (gitignored):

```bash
REACT_APP_API_BASE_URL=http://192.168.20.113:8080
```

Docker Compose for a reviewable frontend plus mock API is documented in `docker/README.md`.
