# Docker review stack

This stack runs the production `wms-client` bundle and an in-memory mock of the `wmstool` API. It is for UI review. It does not replace the Java service and it does not persist data: restarting `mock` restores the seed data.

From the repository root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

Then open http://localhost:3000.

| Service   | Host port | Container | Purpose                                      |
| --------- | --------- | --------- | -------------------------------------------- |
| frontend  | 3000      | 80        | nginx SPA plus `/api` reverse proxy          |
| mock      | 8080      | 8080      | fake API, also reachable directly for curl   |

Stop it with Ctrl+C, or `docker compose -f docker/docker-compose.yml down`.

## Log in

The login form posts `{ employeeId, password }` to `/api/user/login`. A successful response is `{ accessToken: "Bearer <jwt>", tokenType: "Bearer " }`. The JWT payload matches what the React header reads: `fullName` and `role.authority` (`ROLE_Admin`, `ROLE_Operator`, `ROLE_Sales`, `ROLE_Normal`). A wrong password returns HTTP 401 `{ username: "無效的員工編號", password: "無效的密碼" }`.

| Employee id | Password      | Role in the UI   | What you can open                                      |
| ----------- | ------------- | ---------------- | ------------------------------------------------------ |
| admin       | admin123      | 管理員           | every menu, including 檔案總管 and 管理員區域         |
| operator    | operator123   | 庫存相關人員     | in-stock, stock change, pull list, history             |
| sales       | sales123      | 業務             | 庫存查詢 and 歷史記錄查詢                              |
| store       | store123      | 一般人員/門市    | basic 庫存查詢 and 出庫單查詢                          |

After login the app lands on `/`, which only renders the navbar. Open a menu item from there. Use a desktop-width window so the Bootstrap navbar is expanded.

## Seeded data to click through

Product numbers are matched in upper case, the same way the Java service does.

| Product  | What it shows                                                                 |
| -------- | ----------------------------------------------------------------------------- |
| CF1001   | 精梳棉布. On-hand 板卷 and 整支, a shrink history tree, and an in-stock rollback row |
| CF1002   | 亞麻胚布. One roll is already on the shrink list (waitToShrink)              |
| HW9001   | 包裝紙箱, type 雜項, so color/defect columns stay hidden                     |
| CF1003   | Known product with an empty on-hand list (the yellow "no stock" alert)       |

| Screen                         | Value to type                                      |
| ------------------------------ | -------------------------------------------------- |
| 進貨單入庫 `/stock/1/1`        | `IN2026001` (CF1001 still has quantity to receive) |
| 組裝單入庫 `/stock/1/2`        | `AS2026001`                                        |
| 退貨單入庫 `/stock/1/3`        | `CR2026001`                                        |
| 調撥單入庫 `/stock/1/4`        | `SR2026001`                                        |
| 出庫單查詢 `/stock/2/3`        | `OS2026001`                                        |
| 庫存查詢                       | `CF1001`, `CF1002`, `HW9001`, or `CF1003`          |
| 入庫回朔                       | order type 進貨單, order no `IN2026001`            |
| 減肥回朔                       | `CF1001`                                           |
| 拉貨明細 `/stock/4`            | today's rows for 陳管理 and 林倉管                 |
| 檔案總管                       | 檔案查詢 returns today's xls names; download works |
| 庫存類別                       | 棉布, 麻布, 五金                                   |

An unknown order number returns empty `currentStatus` / `waitHandleStatus`, which the in-stock screens show as "查無此單".

## Point the UI at a real backend later

The browser calls `/api/...` on the frontend origin. nginx proxies that prefix to `BACKEND_UPSTREAM` (default `http://mock:8080`), so the mock does not need CORS for the Compose setup.

To use another backend from the same image, change the upstream and recreate the frontend container. No JavaScript rebuild is required:

```bash
BACKEND_UPSTREAM=http://192.168.20.113:8080 docker compose -f docker/docker-compose.yml up -d frontend
```

The host in `BACKEND_UPSTREAM` must be reachable from the frontend container. When the browser should call a backend directly, set `API_BASE_URL` instead (the container rewrites `/config.js` before nginx starts):

```bash
API_BASE_URL=http://192.168.20.113:8080 docker compose -f docker/docker-compose.yml up -d frontend
```

`wmstool` already allows cross-origin browser calls (`WebMvcConfig` permits every origin). Leave `API_BASE_URL` empty when the nginx proxy is used.

For `npm start` outside Docker, set `REACT_APP_API_BASE_URL` in `wms-client/.env.local`. See `wms-client/README.md`.

## What the mock does not reproduce

- No WebSocket client calls exist in `wms-client`; none are mocked.
- Excel import (`POST /api/file/import/inStockFile`) accepts the `files` part and returns 200. It does not parse workbook rows into stock. The admin screen only checks that status.
- `POST /api/file/import/setWHFile` is called from `FileActions.js`, but `FileController` has no such mapping and the 設定倉別 button is disabled. The mock returns 200 so the action does not 404.
- `FileService.findTodayFile` falls through its switch, so the real adjustment/allocation "today" query can return the daily-comparison name. The mock returns the file for the requested category.
- Real out-stock interval queries use `Period.getDays()` (the day-of-month field only). The mock lists every calendar day from start through end.
- History trees are returned for seeded stock whose first in-stock date falls in the requested range. They are not rebuilt from the SQL Server history tables.
- Downloaded spreadsheets are small UTF-8 stand-ins with an `.xls` content type, not workbooks produced by Apache POI.
- JWT signatures are not signed with `jwt.jwtSecret`. The UI only decodes the payload. Tokens expire after 12 hours.
- `GET /health` is mock-only and is not part of `wmstool`.
