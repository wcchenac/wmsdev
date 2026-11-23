async (page) => {
  // Header stickiness: scroll a long page at 1440/700, and the toggler menu on a short phone.
  // Set LABEL to before|after. Needs vite on :3100 and the mock API on :8080.
  const LABEL = 'after';
  const DIR = '/Users/wcchenac/wmsdev/.playwright-mcp/sticky-header/' + LABEL + '/';
  const BASE = globalThis.__WMS_BASE__ || 'http://localhost:3100';
  const API = globalThis.__WMS_API__ || 'http://localhost:8080';
  const token = (await (await page.request.post(API + '/api/user/login', { data: { employeeId: 'admin', password: 'admin123' } })).json()).accessToken;
  await page.goto(BASE + '/login', { waitUntil: 'load' });
  await page.evaluate((t) => { localStorage.clear(); localStorage.setItem('jwtToken', t); }, token);
  const out = {};
  const navState = () => page.evaluate(() => {
    const nav = document.querySelector('nav.navbar').getBoundingClientRect();
    const main = document.querySelector('main').getBoundingClientRect();
    return `scrollY=${Math.round(window.scrollY)} navTop=${Math.round(nav.top)} navH=${Math.round(nav.height)} mainTop=${Math.round(main.top)}`;
  });

  for (const width of [1440, 700]) {
    await page.setViewportSize({ width, height: 700 });
    // 庫存異動 with a product: a page longer than the window.
    await page.goto(BASE + '/stock/3/1', { waitUntil: 'networkidle' });
    await page.locator('#productNo-search').fill('CF1001');
    await page.locator('#productNo-search').press('Enter');
    await page.waitForTimeout(1200);
    await page.mouse.move(width - 1, 699);
    out[`${width} top`] = await navState();
    await page.screenshot({ path: `${DIR}${width}-1-top.png`, animations: 'disabled', caret: 'hide' });
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);
    out[`${width} scrolled`] = await navState();
    await page.screenshot({ path: `${DIR}${width}-2-scrolled.png`, animations: 'disabled', caret: 'hide' });
  }

  // Toggler menu on a short phone screen: can 登出 (the last item) be reached?
  await page.setViewportSize({ width: 375, height: 480 });
  await page.goto(BASE + '/stock/3/1', { waitUntil: 'networkidle' });
  await page.locator('.navbar-toggler').click();
  await page.waitForTimeout(400);
  await page.locator('#mobile-nav').getByRole('button', { name: '庫存異動作業' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}375-3-menu.png`, animations: 'disabled', caret: 'hide' });
  const logout = page.locator('#mobile-nav').getByRole('button', { name: '登出' });
  await logout.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  out['375x480 menu'] = await page.evaluate(() => {
    const c = document.querySelector('#mobile-nav');
    const b = [...c.querySelectorAll('button')].find((x) => x.textContent.trim() === '登出').getBoundingClientRect();
    return `menuH=${Math.round(c.getBoundingClientRect().height)} menuScroll=${c.scrollHeight > c.clientHeight} logoutTop=${Math.round(b.top)} logoutBottom=${Math.round(b.bottom)} inView=${b.top >= 0 && b.bottom <= window.innerHeight}`;
  });
  await page.screenshot({ path: `${DIR}375-4-menu-logout.png`, animations: 'disabled', caret: 'hide' });
  return out;
}
