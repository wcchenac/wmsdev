async (page) => {
  // Screenshots of the loading overlay while a request hangs. Set LABEL to 'before' or 'after'.
  const LABEL = 'after';
  const DIR = '/Users/wcchenac/wmsdev/.playwright-mcp/overlay/' + LABEL + '/';
  const BASE = globalThis.__WMS_BASE__ || 'http://localhost:3100';
  const API = globalThis.__WMS_API__ || 'http://localhost:8080';
  const token = (await (await page.request.post(API + '/api/user/login', { data: { employeeId: 'admin', password: 'admin123' } })).json()).accessToken;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.evaluate((t) => { localStorage.clear(); localStorage.setItem('jwtToken', t); }, token);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 150)));
  const hang = (pattern) => page.route(pattern, () => new Promise(() => undefined));
  const shot = async (name) => {
    await page.waitForTimeout(1200);
    await page.screenshot({ path: DIR + name + '.png', animations: 'disabled', caret: 'hide' });
  };
  const out = {};

  // 1. Stock query, request pending
  await page.goto(BASE + '/stock/2/2', { waitUntil: 'networkidle' });
  await hang('**/api/stock/queryStock/**');
  await page.locator('#productNo-search').fill('CF1001');
  await page.locator('#productNo-search').press('Enter');
  await shot('1-query-loading');
  await page.unrouteAll({ behavior: 'ignoreErrors' });

  // 2. Stock query answered: overlay inactive
  await page.goto(BASE + '/stock/2/2', { waitUntil: 'networkidle' });
  await page.locator('#productNo-search').fill('CF1001');
  await page.locator('#productNo-search').press('Enter');
  await page.waitForTimeout(1500);
  await shot('2-query-done');

  // 3. In-stock order query, pending
  await page.goto(BASE + '/stock/1/1', { waitUntil: 'networkidle' });
  await hang('**/api/stock/queryOrder/**');
  await page.locator('input[name=orderNo]').fill('IN2026001');
  await page.locator('input[name=orderNo]').press('Enter');
  await shot('3-instock-loading');
  await page.unrouteAll({ behavior: 'ignoreErrors' });

  // 4. Shrink list, initial load pending
  await hang('**/api/stock/queryStock/shrinkList');
  await page.goto(BASE + '/stock/3/2', { waitUntil: 'domcontentloaded' });
  await shot('4-shrink-loading');
  await page.unrouteAll({ behavior: 'ignoreErrors' });

  // 5. Register user, pending
  await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
  await page.locator('main').getByText('新增使用者', { exact: true }).first().click();
  await page.locator('main [name=employeeId]').fill('zz001');
  await page.locator('main [name=fullName]').fill('測試');
  await page.locator('main [name=password]').fill('pw123');
  await page.locator('main [name=role]').selectOption('ROLE_Normal');
  await hang('**/user/register');
  await page.locator('main').getByRole('button', { name: '註冊' }).click();
  await shot('5-register-loading');
  await page.unrouteAll({ behavior: 'ignoreErrors' });

  out.overlayClasses = await page.evaluate(() =>
    [...new Set([...document.querySelectorAll('[class*="_loading_overlay_"]')].map((e) => e.className.split(' ').find((c) => c.startsWith('_loading_overlay_'))))]
  );
  out.errors = errors;
  return out;
}
