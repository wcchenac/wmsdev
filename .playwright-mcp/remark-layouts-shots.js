async (page) => {
  // 庫存異動 table for both layouts: 布料 (CF1001) and 五金 (HW9001), normal data and one
  // 255-character 註解 (the query response is rewritten in the browser; the mock's data is not
  // changed), at 1440/1200/1100/992/700px. Set LABEL to before|after.
  const LABEL = 'after';
  const DIR = '/Users/wcchenac/wmsdev/.playwright-mcp/remark-layouts/' + LABEL + '/';
  const BASE = globalThis.__WMS_BASE__ || 'http://localhost:3100';
  const API = globalThis.__WMS_API__ || 'http://localhost:8080';
  const LONG = '客戶指定此批貨需於下週一前出貨並附檢驗報告與出貨單據影本，若有延誤請先聯絡業務窗口確認後續處理方式。'.repeat(6).slice(0, 255);
  const token = (await (await page.request.post(API + '/api/user/login', { data: { employeeId: 'admin', password: 'admin123' } })).json()).accessToken;
  await page.goto(BASE + '/login', { waitUntil: 'load' });
  await page.evaluate((t) => { localStorage.clear(); localStorage.setItem('jwtToken', t); }, token);
  const out = {};
  for (const [layout, productNo] of [['布料', 'CF1001'], ['五金', 'HW9001']]) {
    for (const long of [false, true]) {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      if (long) {
        await page.route('**/api/stock/queryStock/query/1/*', async (route) => {
          const res = await route.fetch();
          const body = await res.json();
          body.result[Math.min(1, body.result.length - 1)].remark = LONG;
          await route.fulfill({ response: res, json: body });
        });
      }
      for (const width of [1440, 1200, 1100, 992, 700]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(BASE + '/stock/3/1', { waitUntil: 'networkidle' });
        await page.locator('#productNo-search').fill(productNo);
        await page.locator('#productNo-search').press('Enter');
        await page.waitForTimeout(1200);
        await page.mouse.move(width - 1, 899);
        await page.evaluate(() => document.activeElement && document.activeElement.blur());
        await page.screenshot({ path: `${DIR}${productNo}-${long ? 'long' : 'normal'}-${width}.png`, fullPage: true, animations: 'disabled', caret: 'hide' });
        out[`${layout} ${long ? '255字' : '一般'} ${width}`] = await page.evaluate(() => {
          const t = document.querySelector('.scrollbar-70 table');
          const box = t.parentElement.getBoundingClientRect();
          const rows = [...t.querySelectorAll('tbody tr')];
          const tall = rows.reduce((a, r) => (r.getBoundingClientRect().height > a.getBoundingClientRect().height ? r : a));
          const rowBox = tall.getBoundingClientRect();
          const ship = [...tall.querySelectorAll('button')].find((b) => b.textContent.trim() === '出庫').getBoundingClientRect();
          return `table=${Math.round(t.getBoundingClientRect().width)}/${Math.round(box.width)} scrollX=${t.getBoundingClientRect().width > box.width + 1} rowH=${Math.round(rowBox.height)} 出庫InBoxX=${ship.right <= box.right + 1} 出庫BelowRowTop=${Math.round(ship.top - rowBox.top)}`;
        });
      }
    }
  }
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  return out;
}
