async (page) => {
  // 入庫 Step 3 and 減肥申請 with a 數量 validation message showing (typed "abc"), at
  // 1440/1200/992/700px: table vs box width, the row height, and the message's lines.
  const LABEL = 'after';
  const DIR = '/Users/wcchenac/wmsdev/.playwright-mcp/qty-error/' + LABEL + '/';
  const BASE = globalThis.__WMS_BASE__ || 'http://localhost:3100';
  const API = globalThis.__WMS_API__ || 'http://localhost:8080';
  const token = (await (await page.request.post(API + '/api/user/login', { data: { employeeId: 'admin', password: 'admin123' } })).json()).accessToken;
  await page.goto(BASE + '/login', { waitUntil: 'load' });
  await page.evaluate((t) => { localStorage.clear(); localStorage.setItem('jwtToken', t); }, token);
  const measure = () => page.evaluate(() => {
    const fb = [...document.querySelectorAll('main .invalid-feedback')].find((e) => e.offsetParent);
    if (!fb) return 'no feedback shown';
    const t = fb.closest('table');
    let box = t.parentElement;
    for (let e = t.parentElement; e && e !== document.body; e = e.parentElement) {
      const ox = getComputedStyle(e).overflowX; if (ox === 'auto' || ox === 'scroll') { box = e; break; }
    }
    const lh = parseFloat(getComputedStyle(fb).lineHeight) || 20;
    const tw = t.getBoundingClientRect().width, bw = box.getBoundingClientRect().width;
    return `table=${Math.round(tw)}/${Math.round(bw)}${tw > bw + 1 ? ' 橫捲' : ''} rowH=${Math.round(fb.closest('tr').getBoundingClientRect().height)} message ${Math.round(fb.getBoundingClientRect().width)}px wide, ${Math.round(fb.getBoundingClientRect().height / lh)} line(s)`;
  });
  const out = {};
  for (const width of [1440, 1200, 992, 700]) {
    await page.setViewportSize({ width, height: 900 });
    // 入庫 Step 3
    await page.goto(BASE + '/stock/1/1', { waitUntil: 'networkidle' });
    const i = page.locator('input[name=orderNo]'); await i.fill('IN2026001'); await i.press('Enter'); await page.waitForTimeout(1200);
    const cb = page.locator('main input[type=checkbox]'); for (let k = 0; k < Math.min(await cb.count(), 2); k++) await cb.nth(k).check({ force: true });
    await page.locator('main').getByRole('button', { name: '下一步' }).first().click(); await page.waitForTimeout(800);
    await page.locator('main .table-responsive input[name="quantity"]').first().fill('abc');
    await page.waitForTimeout(300);
    await page.mouse.move(width - 1, 899);
    await page.screenshot({ path: `${DIR}instock-step3-${width}.png`, fullPage: true, animations: 'disabled', caret: 'hide' });
    out[`入庫 Step 3 @${width}`] = await measure();
    // 減肥申請 (板卷異動)
    await page.goto(BASE + '/stock/3/2', { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
    await page.locator('main').getByRole('button', { name: '板卷異動' }).first().click(); await page.waitForTimeout(800);
    await page.locator('main .table-responsive input[name="quantity"]').first().fill('abc');
    await page.waitForTimeout(300);
    await page.mouse.move(width - 1, 899);
    await page.screenshot({ path: `${DIR}shrink-request-${width}.png`, fullPage: true, animations: 'disabled', caret: 'hide' });
    out[`減肥申請 @${width}`] = await measure();
  }
  return out;
}
