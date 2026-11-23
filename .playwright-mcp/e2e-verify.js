async (page) => {
  // End-to-end functional, RBAC, and RWD verification against a freshly started mock API (:8080)
  // and Vite server (:3100). Mutating checks create/update temporary mock state only.
  const BASE = globalThis.__WMS_BASE__ || 'http://localhost:3100';
  const API = globalThis.__WMS_API__ || 'http://localhost:8080';
  const passed = [];
  const failed = [];
  const pageErrors = [];
  const consoleErrors = [];
  let allowExpectedHttpError = false;

  page.on('pageerror', (e) => pageErrors.push(e.message.split('\n')[0].slice(0, 200)));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text().split('\n')[0].slice(0, 200);
    if (allowExpectedHttpError && /40[01]/.test(text)) return;
    consoleErrors.push(text);
  });

  const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
  };
  const check = async (name, fn) => {
    try {
      await fn();
      passed.push(name);
    } catch (e) {
      failed.push(`${name}: ${e.message.split('\n')[0].slice(0, 160)}`);
    }
  };
  const tokenFor = async (id, pw) => {
    const res = await page.request.post(`${API}/api/user/login`, {
      data: { employeeId: id, password: pw },
    });
    assert(res.ok(), `login failed for ${id}: ${res.status()}`);
    return (await res.json()).accessToken;
  };
  const setSession = async (token) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'load' });
    await page.evaluate((t) => {
      localStorage.clear();
      if (t) localStorage.setItem('jwtToken', t);
    }, token);
  };
  const go = async (path) => {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  };

  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Auth & Role Redirects / RBAC
  await check('auth-signed-out-redirect', async () => {
    await setSession(null);
    await go('/stock/1/1');
    await page.waitForURL((u) => u.pathname === '/login', { timeout: 5000 });
  });

  await check('auth-invalid-login-error', async () => {
    allowExpectedHttpError = true;
    try {
      await go('/login');
      await page.locator('input[name=employeeId]').fill('wrong');
      await page.locator('input[name=password]').fill('wrong');
      await page.getByRole('button', { name: '登入' }).click();
      await page.locator('.invalid-feedback').first().waitFor({ state: 'visible', timeout: 5000 });
    } finally {
      allowExpectedHttpError = false;
    }
  });

  const tokens = {
    admin: await tokenFor('admin', 'admin123'),
    operator: await tokenFor('operator', 'operator123'),
    store: await tokenFor('store', 'store123'),
    sales: await tokenFor('sales', 'sales123'),
  };

  await check('rbac-home-redirects', async () => {
    const expected = [
      ['admin', '/stock/1/1'],
      ['operator', '/stock/1/1'],
      ['store', '/stock/2/1'],
      ['sales', '/stock/2/2'],
    ];
    for (const [role, landing] of expected) {
      await setSession(tokens[role]);
      await go('/');
      await page.waitForURL((u) => u.pathname === landing, { timeout: 5000 });
    }
  });

  await check('rbac-protected-route-denials', async () => {
    await setSession(tokens.store);
    await go('/admin');
    await page.waitForURL((u) => u.pathname === '/stock/2/1', { timeout: 5000 });
    await go('/stock/1/1');
    await page.waitForURL((u) => u.pathname === '/stock/2/1', { timeout: 5000 });

    await setSession(tokens.sales);
    await go('/stock/4');
    await page.waitForURL((u) => u.pathname === '/stock/2/2', { timeout: 5000 });
  });

  // 2. Basic Query & Empty State (/stock/2/1 as store)
  await check('query-store-basic-and-empty', async () => {
    await setSession(tokens.store);
    await go('/stock/2/1');
    await page.locator('#productNo-search').fill('CF1001');
    await page.locator('#productNo-search').press('Enter');
    await page.locator('main table tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });

    await page.getByRole('button', { name: '貨號資料' }).click();
    const modal = page.locator('.modal.show');
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    assert((await modal.getByText('基本資訊').count()) === 1, 'expected 基本資訊');
    assert((await modal.getByText('進階資訊').count()) === 0, 'store must not see 進階資訊');
    await modal.getByRole('button', { name: 'Close' }).click();
    await page.locator('.modal').first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    await page.locator('#productNo-search').fill('CF1003');
    await page.locator('#productNo-search').press('Enter');
    await page.getByRole('heading', { name: '查無庫存資料' }).waitFor({ state: 'visible', timeout: 8000 });
  });

  // 3. Assemble Order & Validation (/stock/1/2)
  await check('instock-assemble-validation', async () => {
    await setSession(tokens.admin);
    await go('/stock/1/2');
    const orderInput = page.locator('input[name=orderNo]');
    await orderInput.fill('AS2026001');
    await orderInput.press('Enter');
    await page.locator('main input[type=checkbox]').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('main').getByRole('button', { name: '下一步' }).first().click();

    const qtyInput = page.locator('main .scrollbar-70 .tab-pane.active input[name=quantity]').first();
    await qtyInput.fill('abc');
    await page.locator('main .scrollbar-70 .tab-pane.active .invalid-feedback').first().waitFor({ state: 'visible', timeout: 5000 });
    assert(await page.locator('main .scrollbar-70 .tab-pane.active').getByRole('button', { name: '送出' }).isDisabled(), 'submit must stay disabled on invalid qty');
  });

  // 4. Normal InStock Submit (/stock/1/1 with IN2026001 -> CF1002 = 80)
  await check('instock-normal-submit', async () => {
    await setSession(tokens.admin);
    await go('/stock/1/1');
    const orderInput = page.locator('input[name=orderNo]');
    await orderInput.fill('IN2026001');
    await orderInput.press('Enter');
    await page.locator('main input[type=checkbox]').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('main').getByRole('button', { name: '下一步' }).first().click();

    // Switch to CF1002 tab (single type: 板卷 80) and submit cleanly.
    await page.locator('main .nav-tabs .nav-link', { hasText: 'CF1002' }).click();
    const activePane = page.locator('main .scrollbar-70 .tab-pane.active');
    await activePane.locator('input[name=quantity]').first().fill('80');
    const submitBtn = activePane.getByRole('button', { name: '送出' });
    assert(await submitBtn.isEnabled(), 'submit should enable after matching total');
    await submitBtn.click();
    await page.locator('.alert-success, main button:disabled').first().waitFor({ timeout: 5000 });
  });

  // 5. ModifyStock Edit + Ship (/stock/3/1)
  await check('modify-stock-edit-and-ship', async () => {
    await setSession(tokens.admin);
    await go('/stock/3/1');
    await page.locator('#productNo-search').fill('CF1001');
    await page.locator('#productNo-search').press('Enter');
    await page.locator('main table tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });

    // Edit remark via InformationModal
    await page.locator('main').getByText('詳細資料', { exact: true }).first().click();
    const infoModal = page.locator('.modal.show');
    await infoModal.waitFor({ state: 'visible', timeout: 5000 });
    await infoModal.getByRole('button', { name: '編輯' }).click();
    const remarkField = infoModal.locator('textarea[name=remark], input[name=remark]').first();
    await remarkField.fill('E2E 更新備註');
    await infoModal.getByRole('button', { name: '確認' }).click();
    await infoModal.waitFor({ state: 'hidden', timeout: 5000 });

    // Ship first available item via ShipModal
    await page.locator('main').getByText('出庫', { exact: true }).first().click();
    const shipModal = page.locator('.modal.show');
    await shipModal.waitFor({ state: 'visible', timeout: 5000 });
    await shipModal.getByRole('button', { name: '中壢' }).click();
    await shipModal.getByRole('button', { name: '確認' }).click();
    await shipModal.waitFor({ state: 'hidden', timeout: 5000 });
  });

  // 6. Admin User Register + Edit + Delete ConfirmDialog + ScheduleMission
  await check('admin-user-lifecycle-and-schedule', async () => {
    await setSession(tokens.admin);
    await go('/admin');

    // Register user
    await page.locator('main').getByText('新增使用者', { exact: true }).first().click();
    await page.locator('main [name=employeeId]').fill('e2e001');
    await page.locator('main [name=fullName]').fill('測試人員');
    await page.locator('main [name=password]').fill('pw123456');
    await page.locator('main [name=role]').selectOption('ROLE_Normal');
    await page.locator('main').getByRole('button', { name: '註冊' }).click();
    await page.locator('.Toastify__toast--success').filter({ hasText: '新增使用者成功' }).waitFor({ state: 'visible', timeout: 5000 });

    // Load user list & edit e2e001
    await page.locator('main').getByText('使用者管理', { exact: true }).first().click();
    await page.getByRole('button', { name: '讀取員工清單' }).click();
    const row = page.locator('.MuiDataGrid-row').filter({ hasText: 'e2e001' }).first();
    await row.waitFor({ state: 'visible', timeout: 5000 });
    await row.getByRole('button', { name: '編輯' }).click();
    const editModal = page.locator('.modal.show');
    await editModal.waitFor({ state: 'visible', timeout: 5000 });
    await editModal.getByRole('button', { name: '編輯' }).click();
    await editModal.locator('select[name=role]').selectOption('ROLE_Sales');
    await editModal.getByRole('button', { name: '儲存' }).click();
    await editModal.waitFor({ state: 'hidden', timeout: 5000 });

    // Delete e2e001 via ConfirmDialog
    await row.getByRole('button', { name: '刪除' }).click();
    const confirmModal = page.locator('.modal.show');
    await confirmModal.waitFor({ state: 'visible', timeout: 5000 });
    await confirmModal.getByRole('button', { name: '刪除' }).click();
    await confirmModal.waitFor({ state: 'hidden', timeout: 5000 });
    await page.locator('.Toastify__toast--success').filter({ hasText: 'e2e001' }).waitFor({ state: 'visible', timeout: 5000 });

    // Trigger ScheduleMission
    await page.locator('main').getByText('任務排程', { exact: true }).first().click();
    await page.getByRole('button', { name: '每日比對' }).click();
    await page.locator('.Toastify__toast--success').filter({ hasText: 'Misson Complete' }).waitFor({ state: 'visible', timeout: 5000 });
  });

  // 7. Mobile RWD Navigation & Admin Drawer (375x812)
  await check('rwd-mobile-nav-and-admin-drawer', async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setSession(tokens.admin);
    await go('/admin');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert(!overflow, 'horizontal overflow at 375px on /admin');

    await page.locator('.navbar-toggler').click();
    await page.locator('#mobile-nav.show').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.navbar-toggler').click();

    await page.getByRole('button', { name: /開啟管理選單/ }).click();
    await page.locator('#admin-sidebar').getByText('庫存類別', { exact: true }).click();
    await page.locator('main table, main .form-control, main button').first().waitFor({ state: 'visible', timeout: 5000 });
  });

  return JSON.stringify({
    total: passed.length + failed.length,
    passed: passed.length,
    failed,
    pageErrors: [...new Set(pageErrors)],
    consoleErrors: [...new Set(consoleErrors)],
  }, null, 2);
}
