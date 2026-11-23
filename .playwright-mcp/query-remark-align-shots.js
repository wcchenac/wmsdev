async (page) => {
  // 庫存查詢 (/stock/2/2, Admin) for 布料 (CF1001) and 五金 (HW9001), normal data and one
  // 255-character 註解 (the query response is rewritten in the browser; the mock's data is not
  // changed), at 1440/1200/992/700px: the tallest row's height and where each cell's text starts
  // (px below the row top). Set LABEL to before|after.
  const LABEL = 'after';
  const DIR = '/Users/wcchenac/wmsdev/.playwright-mcp/query-remark-align/' + LABEL + '/';
  const BASE = globalThis.__WMS_BASE__ || 'http://localhost:3100';
  const API = globalThis.__WMS_API__ || 'http://localhost:8080';
  const LONG = '客戶指定此批貨需於下週一前出貨並附檢驗報告與出貨單據影本，若有延誤請先聯絡業務窗口確認後續處理方式。'.repeat(6).slice(0, 255);
  const token = (await (await page.request.post(API + '/api/user/login', { data: { employeeId: 'admin', password: 'admin123' } })).json()).accessToken;
  await page.goto(BASE + '/login', { waitUntil: 'load' });
  await page.evaluate((t) => { localStorage.clear(); localStorage.setItem('jwtToken', t); }, token);
  const setLong = (body) => {
    // Put LONG on the second row of the first array of rows that have a remark field.
    const visit = (v) => {
      if (Array.isArray(v)) {
        const rows = v.filter((x) => x && typeof x === 'object' && 'remark' in x);
        if (rows.length) { rows[Math.min(1, rows.length - 1)].remark = LONG; return true; }
        return v.some(visit);
      }
      if (v && typeof v === 'object') return Object.values(v).some(visit);
      return false;
    };
    return visit(body);
  };
  const out = {};
  for (const [layout, productNo] of [['布料', 'CF1001'], ['五金', 'HW9001']]) {
    for (const long of [false, true]) {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      if (long) {
        await page.route('**/api/stock/queryStock/query/**', async (route) => {
          const res = await route.fetch();
          const body = await res.json();
          if (!setLong(body)) throw new Error('no remark field in ' + route.request().url());
          await route.fulfill({ response: res, json: body });
        });
      }
      for (const width of [1440, 1200, 992, 700]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(BASE + '/stock/2/2', { waitUntil: 'networkidle' });
        await page.locator('#productNo-search').fill(productNo);
        await page.locator('#productNo-search').press('Enter');
        await page.waitForTimeout(1200);
        await page.mouse.move(width - 1, 899);
        await page.evaluate(() => document.activeElement && document.activeElement.blur());
        await page.screenshot({ path: `${DIR}${productNo}-${long ? 'long' : 'normal'}-${width}.png`, fullPage: true, animations: 'disabled', caret: 'hide' });
        out[`${layout} ${long ? '255字' : '一般'} ${width}`] = await page.evaluate(() => {
          const t = document.querySelector('.scrollbar-70 table');
          const box = t.parentElement;
          const rows = [...t.querySelectorAll('tbody tr')];
          const tall = rows.reduce((a, r) => (r.getBoundingClientRect().height > a.getBoundingClientRect().height ? r : a));
          const top = tall.getBoundingClientRect().top;
          const textTop = (td) => {
            const w = document.createTreeWalker(td, NodeFilter.SHOW_TEXT);
            let n; while ((n = w.nextNode())) { if (n.textContent.trim()) { const r = document.createRange(); r.selectNodeContents(n); return Math.round(r.getClientRects()[0].top - top); } }
            return '-';
          };
          const offs = [...tall.children].map(textTop);
          return `rows=${rows.length} tallRowH=${Math.round(tall.getBoundingClientRect().height)} textTop=[${offs.join(',')}] scrollX=${box.scrollWidth > box.clientWidth + 1}`;
        });
      }
    }
  }
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  return out;
}
