# wms-client visual regression scripts

Before/after screenshot comparison for layout changes in `wms-client`. The scripts are
Playwright MCP `browser_run_code_unsafe` functions: run them with the tool's `filename`
argument. The MCP only reads script files under `/Users/wcchenac/wmsdev`, so they live here
rather than in the `feature/refactor` worktree.

| File | What it does |
|---|---|
| `visual.template.js` | Logs in as admin, walks the pages and modals, saves full-page screenshots to `<LABEL>/`. Edit the steps here. |
| `visual-before.js` / `visual-after.js` | The template with `LABEL` set to `before` / `after`. Regenerate after editing the template (command below). |
| `pixeldiff.js` | Compares every `before/*.png` with `after/*.png`, reports changed pixel count and bounding box, or a size change. |
| `compare.js` | Writes `compare/<name>.png`: BEFORE crop stacked over AFTER crop. Edit `ITEMS` (name + crop box). |

## Run

1. Start the mock API and a dev server that calls it directly (the worktree has no `.env`;
   without the variable every API call hits Vite itself and pages crash with `x.map is not a function`):

   ```bash
   cd /Users/wcchenac/wmsdev-feature-refactor
   docker compose -f docker/docker-compose.yml up -d mock
   cd wms-client && REACT_APP_API_BASE_URL=http://192.168.8.127:8080 npx vite --port 3100 --strictPort
   ```

   Port 3000 and 8080 on 127.0.0.1 are taken by VS Code port forwarding, hence port 3100 and the LAN IP.
   The mock allows CORS from the dev server.

2. Regenerate the two scripts if the template changed:

   ```bash
   cd /Users/wcchenac/wmsdev/.playwright-mcp
   sed 's/__LABEL__/before/' visual.template.js > visual-before.js
   sed 's/__LABEL__/after/'  visual.template.js > visual-after.js
   mkdir -p before after compare
   ```

3. Restart the mock (its data is in memory), then run `visual-before.js`.
4. Make the code change. Vite hot-reloads it.
5. Restart the mock again, then run `visual-after.js`.
6. Serve this folder and diff:

   ```bash
   python3 -m http.server 8765 --bind 127.0.0.1   # from this folder
   ```

   Run `pixeldiff.js`, then set `ITEMS` in `compare.js` for the changed screenshots and run it.
   Read the images in `compare/`.

## Reading the diff

Two runs with no code change differ by at most about 12 scattered pixels (antialiasing), and a
focused input can add a few thousand pixels around its focus ring. A size change or a dense
changed box well above that is a real layout change and needs a visual check.

Each script returns `fails` (steps whose selector did not match) and `errors` (uncaught page
errors). Both should be empty before the screenshots are trusted.

## Storybook check

`storybook-check.js` opens every story from Storybook's `index.json` and lists the ones that
fail. Start Storybook first:

```bash
cd /Users/wcchenac/wmsdev-feature-refactor/wms-client && npm run storybook -- --no-open --ci
```

A story fails on an uncaught page error, Storybook's error display, a render that does not
reach the `finished` phase, or any console error. Console errors matter: Storybook 10 reports a
failed `play` assertion only as a console error, and the story still reaches `finished`.

The result is `{ total, withPlay, passed, failed }`; `failed` should be empty.
