FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY wms-client/package.json wms-client/package-lock.json wms-client/.npmrc ./
RUN npm ci --no-audit --no-fund

COPY wms-client/ ./

# Vite reads REACT_APP_* as well as VITE_* (envPrefix in vite.config.ts).
ARG REACT_APP_API_BASE_URL=
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY docker/frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/frontend/15-resolver.envsh /docker-entrypoint.d/15-resolver.envsh
COPY docker/frontend/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/15-resolver.envsh /docker-entrypoint.d/40-runtime-config.sh

COPY --from=build /app/build /usr/share/nginx/html

ENV BACKEND_UPSTREAM=http://mock:8080
ENV API_BASE_URL=
EXPOSE 80
