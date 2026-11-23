async (page) => {
  // Centred (EditModal) and centred+scrollable (InformationModal) modals at 375/700/1440px:
  // measures whether .modal can scroll and the dialog's margins. Set LABEL to 'before' or 'after'.
  const LABEL = 'after';
  const DIR = '/Users/wcchenac/wmsdev/.playwright-mcp/modal-margin/' + LABEL + '/';
  const BASE = globalThis.__WMS_BASE__ || 'http://localhost:3100';
  const API = globalThis.__WMS_API__ || 'http://localhost:8080';
  const token = (await (await page.request.post(API + '/api/user/login', { data: { employeeId: 'admin', password: 'admin123' } })).json()).accessToken;
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.evaluate((t) => { localStorage.clear(); localStorage.setItem('jwtToken', t); }, token);
  const measure = () =>
    page.evaluate(() => {
      const m = document.querySelector('.modal.show');
      const d = m.querySelector('.modal-dialog');
      const r = d.getBoundingClientRect();
      const cs = getComputedStyle(d);
      return {
        modalScrollExtra: m.scrollHeight - m.clientHeight,
        margin: cs.margin,
        left: Math.round(r.left),
        right: Math.round(window.innerWidth - r.right),
        dialogH: Math.round(r.height),
        vh: window.innerHeight,
      };
    });
  const out = {};
  const shoot = async (name) => {
    for (const width of [1440, 700, 375]) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${DIR}${name}-${width}.png`, animations: 'disabled', caret: 'hide' });
      out[`${name}-${width}`] = await measure();
    }
    await page.setViewportSize({ width: 1440, height: 800 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  };

  // Centred: user edit modal (opened at desktop width; the admin menu collapses on small screens).
  await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
  await page.locator('main').getByText('使用者管理', { exact: true }).first().click();
  await page.getByRole('button', { name: '讀取員工清單' }).click();
  await page.waitForTimeout(1200);
  await page.locator('.MuiDataGrid-row').first().getByRole('button', { name: '編輯' }).click();
  await page.waitForTimeout(700);
  await shoot('edit-centred');

  // Centred + scrollable: stock information modal on 庫存異動.
  await page.goto(BASE + '/stock/3/1', { waitUntil: 'networkidle' });
  const q = page.locator('main input[name=productNo]').first();
  await q.fill('CF1001');
  await q.press('Enter');
  await page.waitForTimeout(1200);
  await page.locator('main').getByText('詳細資料', { exact: true }).first().click();
  await page.waitForTimeout(700);
  await shoot('info-scrollable');
  return out;
}
