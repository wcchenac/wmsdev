# wms-client Playwright verification scripts

Before/after visual comparison and end-to-end verification for `wms-client`. The scripts are
Playwright MCP `browser_run_code_unsafe` functions: run them with the tool's `filename`
argument. The MCP only reads script files under `/Users/wcchenac/wmsdev`, so they live here.

| File | What it does |
|---|---|
| `visual.template.js` | Logs in as admin (plus `/stock/2/1` store queries), walks routes and modals at `1440x900`, saves full-page screenshots to `<LABEL>/`, and checks `pageerror` + `console.error`. Edit the steps here. |
| `visual-before.js` / `visual-after.js` | The template with `LABEL` set to `before` / `after`. Regenerate after editing the template (command below). |
| `e2e-verify.js` | Runs functional E2E checks (auth/RBAC redirects across 4 roles, query/empty state, validation, InStock submit, ModifyStock edit+ship, Admin user CRUD + `ConfirmDialog`, schedule trigger, and `375px` mobile RWD) against a fresh mock API. |
| `pixeldiff.js` | Compares every `before/*.png` with `after/*.png`, reports changed pixel count and bounding box, or a size change. |
| `compare.js` | Writes `compare/<name>.png`: BEFORE crop stacked over AFTER crop. Edit `ITEMS` (name + crop box). |
| `storybook-check.js` | Opens every story from Storybook's `index.json` (`:6006`) and reports failed renders or `play` assertions. |

### Focused layout / RWD diagnostic scripts

| File | What it checks |
|---|---|
| `table-squeeze-survey.js` | Measures table cell wrapping/squeezing across 12 table views at `1440/1200/992/700px`. |
| `navbar-rwd-shots.js` | Checks navbar height, wrapping, overflow, and mobile toggler menu for `admin`/`operator` (`375`–`1440px`). |
| `sticky-header-shots.js` | Verifies sticky header behavior on scroll (`1440/700px`) and mobile menu scrollability (`375x480px`). |
| `scroll-padding-shots.js` | Checks `#main-content`, focused search input, and row `scrollIntoView` top clearance below sticky header. |
| `modal-margin-shots.js` | Measures `.modal-dialog` scroll overflow and left/right margins (`EditModal`, `InformationModal`) at `1440/700/375px`. |
| `overlay-shots.js` | Captures `LoadingOverlay` states while API requests hang via `page.route`. |
| `pull-handled-shots.js` | Tests `/stock/4` handled rows with normal and long PDF filenames (`1440/1200/992/700px`). |
| `qty-error-shots.js` | Verifies `.invalid-feedback` wrapping in `/stock/1/1` Step 3 and `/stock/3/2` shrink request tables. |
| `query-remark-align-shots.js` | Measures row height and cell baseline alignment on `/stock/2/2` (`CF1001`/`HW9001`) with a 255-char `remark`. |
| `remark-layouts-shots.js` | Verifies row height and `出庫` button bounds on `/stock/3/1` (`CF1001`/`HW9001`) with a 255-char `remark`. |

## Run

1. Start the mock API (`:8080`) and Vite (`:3100`, calling the mock API):

   ```bash
   docker compose -f docker/docker-compose.yml up -d mock
   cd wms-client && REACT_APP_API_BASE_URL=http://localhost:8080 npx vite --port 3100 --strictPort
   ```

   Override `globalThis.__WMS_BASE__` / `globalThis.__WMS_API__` before running a script if
   your dev server or mock runs on another host/port.

2. Regenerate the two visual scripts if the template changed:

   ```bash
   cd .playwright-mcp
   sed 's/__LABEL__/before/' visual.template.js > visual-before.js
   sed 's/__LABEL__/after/'  visual.template.js > visual-after.js
   mkdir -p before after compare
   ```

3. Restart the mock (its data is in memory), then run `visual-before.js`, `visual-after.js`,
   or `e2e-verify.js`.

4. Serve this folder and diff:

   ```bash
   python3 -m http.server 8765 --bind 127.0.0.1   # from .playwright-mcp
   ```

   Run `pixeldiff.js`, then set `ITEMS` in `compare.js` for the changed screenshots and run it.
   Read the images in `compare/`.

## Reading the diff

Two runs with no code change differ by at most about 12 scattered pixels (antialiasing), and a
focused input can add a few thousand pixels around its focus ring. A size change or a dense
changed box well above that is a real layout change and needs a visual check.

Each visual script returns `fails`, `errors`, and `consoleErrors`; `e2e-verify.js` returns
`{ total, passed, failed, pageErrors, consoleErrors }`. All error lists should be empty.

## Storybook check

`storybook-check.js` opens every story from Storybook's `index.json` and lists the ones that
fail. Start Storybook first:

```bash
cd wms-client && npm run storybook -- --no-open --ci
```

A story fails on an uncaught page error, Storybook's error display, a render that does not
reach the `finished` phase, or any console error. Console errors matter: Storybook 10 reports a
failed `play` assertion only as a console error, and the story still reaches `finished`.

The result is `{ total, withPlay, passed, failed }`; `failed` should be empty.
