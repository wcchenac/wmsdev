async (page) => {
  // 拉貨明細 with handled rows (download button in the 倉別 cell), list response rewritten in the
  // browser (the mock has no rows). At 1440/1200/992/700px: table vs box, 倉別 column and button
  // widths, whether the file name is cut, and its title. Set LABEL to before|after.
  const LABEL = 'after';
  const DIR = '/Users/wcchenac/wmsdev/.playwright-mcp/pull-handled/' + LABEL + '/';
  const BASE = globalThis.__WMS_BASE__ || 'http://localhost:3100';
  const API = globalThis.__WMS_API__ || 'http://localhost:8080';
  const today = new Date().toJSON().slice(0, 10);
  const row = (id, extra) => ({ id, productNo: 'CF1001', type: '整支', quantity: 36, unit: '碼', color: '1', defect: '', reason: '中壢門市調貨', outStockType: 2, stockIdentifierId: 3, fileName: '', handled: false, deleted: false, requestFrom: '中壢', createdAt: `${today}T09:00:00`, updatedAt: `${today}T09:00:00`, createdBy: '林倉管', updatedBy: '林倉管', ...extra });
  const token = (await (await page.request.post(API + '/api/user/login', { data: { employeeId: 'admin', password: 'admin123' } })).json()).accessToken;
  await page.goto(BASE + '/login', { waitUntil: 'load' });
  await page.evaluate((t) => { localStorage.clear(); localStorage.setItem('jwtToken', t); }, token);
  const out = {};
  for (const [label, fileName] of [['一般檔名', '2026111700001OS2026001.pdf'], ['長檔名', '2026111700001OS2026001_中壢門市調撥補貨單.pdf']]) {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await page.route('**/api/stock/outStock/waitHandleList/basic', (route) =>
      route.fulfill({ json: { userList: ['林倉管'], queryResult: { [today]: [row(11, {}), row(12, { handled: true, fileName })] } } }));
    for (const width of [1440, 1200, 992, 700]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BASE + '/stock/4', { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
      await page.mouse.move(width - 1, 899);
      await page.screenshot({ path: `${DIR}${label}-${width}.png`, fullPage: true, animations: 'disabled', caret: 'hide' });
      out[`${label} @${width}`] = await page.evaluate(() => {
        const t = [...document.querySelectorAll('main table')].find((x) => x.offsetParent);
        let box = t.parentElement;
        for (let e = t.parentElement; e && e !== document.body; e = e.parentElement) {
          const ox = getComputedStyle(e).overflowX; if (ox === 'auto' || ox === 'scroll') { box = e; break; }
        }
        const btn = t.querySelector('button[aria-label^="下載"]');
        const label = btn.querySelector('span');
        const col = btn.closest('td').getBoundingClientRect().width;
        const rows = [...t.querySelectorAll('tbody tr')].map((r) => Math.round(r.getBoundingClientRect().height));
        const tw = t.scrollWidth, bw = box.clientWidth;
        return `content=${tw}/${bw}${tw > bw + 1 ? ` 超出${tw - bw}` : ''} 倉別欄=${Math.round(col)} 按鈕=${Math.round(btn.getBoundingClientRect().width)} 檔名=${Math.round(label.getBoundingClientRect().width)} cut=${label.scrollWidth > label.clientWidth} title=${btn.title || label.title || '-'} rowH=${rows.join('/')}`;
      });
    }
  }
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  return out;
}
