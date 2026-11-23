async (page) => {
  // Under the stuck header: where do scroll-into-view targets land? "before" overrides
  // scroll-padding-top back to auto; "after" is the app as built. 1440/700px on 庫存異動.
  const DIR = '/Users/wcchenac/wmsdev/.playwright-mcp/scroll-padding/';
  const BASE = globalThis.__WMS_BASE__ || 'http://localhost:3100';
  const API = globalThis.__WMS_API__ || 'http://localhost:8080';
  const token = (await (await page.request.post(API + '/api/user/login', { data: { employeeId: 'admin', password: 'admin123' } })).json()).accessToken;
  await page.goto(BASE + '/login', { waitUntil: 'load' });
  await page.evaluate((t) => { localStorage.clear(); localStorage.setItem('jwtToken', t); }, token);
  const out = {};
  for (const label of ['before', 'after']) {
    for (const width of [1440, 700]) {
      await page.setViewportSize({ width, height: 600 });
      await page.goto(BASE + '/stock/3/1', { waitUntil: 'networkidle' });
      if (label === 'before') await page.addStyleTag({ content: 'html { scroll-padding-top: auto !important; }' });
      await page.locator('#productNo-search').fill('CF1001');
      await page.locator('#productNo-search').press('Enter');
      await page.waitForTimeout(1200);
      const navBottom = await page.evaluate(() => document.querySelector('header').getBoundingClientRect().bottom);
      const r = {};
      // 1. the skip link's target
      await page.evaluate(() => { window.scrollTo(0, 0); location.hash = ''; });
      await page.evaluate(() => { location.hash = '#main-content'; });
      await page.waitForTimeout(300);
      r.mainTop = await page.evaluate(() => Math.round(document.querySelector('#main-content').getBoundingClientRect().top));
      // 2. focusing the search field from further down the page
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(200);
      await page.locator('#productNo-search').focus();
      await page.waitForTimeout(300);
      r.searchTop = await page.evaluate(() => Math.round(document.querySelector('#productNo-search').getBoundingClientRect().top));
      // 3. scrollIntoView of a table row
      await page.evaluate(() => document.querySelectorAll('.scrollbar-70 tbody tr')[2].scrollIntoView());
      await page.waitForTimeout(300);
      r.rowTop = await page.evaluate(() => Math.round(document.querySelectorAll('.scrollbar-70 tbody tr')[2].getBoundingClientRect().top));
      await page.screenshot({ path: `${DIR}${label}-${width}-row.png`, animations: 'disabled', caret: 'hide' });
      out[`${label} ${width}`] = `header bottom=${Math.round(navBottom)} | #main-content top=${r.mainTop} | search field top=${r.searchTop} | row top=${r.rowTop}`;
    }
  }
  return out;
}
