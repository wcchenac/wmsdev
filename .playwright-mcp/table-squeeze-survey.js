async (page) => {
  // Survey: do the app's <table>s squeeze text into one character per line? Admin, every page with
  // a table, at 1440/1200/992/700px. Read-only (no data is changed). Screenshots go to
  // table-survey/<page>-<width>.png.
  const DIR = '/Users/wcchenac/wmsdev/.playwright-mcp/table-survey/';
  const BASE = globalThis.__WMS_BASE__ || 'http://localhost:3100';
  const API = globalThis.__WMS_API__ || 'http://localhost:8080';
  const loginAs = async (id, pw) => {
    const token = (await (await page.request.post(API + '/api/user/login', { data: { employeeId: id, password: pw } })).json()).accessToken;
    await page.goto(BASE + '/login', { waitUntil: 'load' });
    await page.evaluate((t) => { localStorage.clear(); localStorage.setItem('jwtToken', t); }, token);
  };

  const go = (p) => page.goto(BASE + p, { waitUntil: 'networkidle' });
  const query = async (no) => { await page.locator('#productNo-search').fill(no); await page.locator('#productNo-search').press('Enter'); await page.waitForTimeout(1200); };
  const order = async (no) => { const i = page.locator('input[name=orderNo]'); await i.fill(no); await i.press('Enter'); await page.waitForTimeout(1200); };
  // Admin side menu: hidden behind a toggle on narrow screens.
  const adminPick = async (label) => {
    await go('/admin');
    const target = page.locator('main').getByText(label, { exact: true }).first();
    if (!(await target.isVisible())) {
      const menu = page.getByRole('button', { name: /開啟管理選單/ });
      if (await menu.count()) { await menu.first().click(); await page.waitForTimeout(400); }
      const inMenu = page.getByText(label, { exact: true }).filter({ visible: true }).first();
      await inMenu.click(); await page.waitForTimeout(500);
      return;
    }
    await target.click(); await page.waitForTimeout(500);
  };

  const PAGES = [
    ['instock-step3', '入庫 Step 3', async () => { await go('/stock/1/1'); await order('IN2026001'); const cb = page.locator('main input[type=checkbox]'); for (let k = 0; k < Math.min(await cb.count(), 2); k++) await cb.nth(k).check({ force: true }); await page.locator('main').getByRole('button', { name: '下一步' }).first().click(); await page.waitForTimeout(700); }],
    ['query-basic', '庫存查詢（基本 /stock/2/1，一般人員）', async () => { await go('/stock/2/1'); await query('CF1001'); }, 'store'],
    ['query-adv', '庫存查詢（進階 /stock/2/2）', async () => { await go('/stock/2/2'); await query('CF1001'); }],
    ['outstock', '出庫單查詢', async () => { await go('/stock/2/3'); await order('OS2026001'); }],
    ['modify', '庫存異動（已修，對照）', async () => { await go('/stock/3/1'); await query('CF1001'); }],
    ['shrink-list', '減肥清單', async () => { await go('/stock/3/2'); await page.waitForTimeout(600); }],
    ['shrink-request', '減肥申請（板卷異動）', async () => { await go('/stock/3/2'); await page.waitForTimeout(600); await page.locator('main').getByRole('button', { name: '板卷異動' }).first().click(); await page.waitForTimeout(800); }],
    ['pull-list', '拉貨明細', async () => { await go('/stock/4'); await page.waitForTimeout(600); }],
    ['history', '歷史記錄查詢', async () => { await go('/stock/5'); await query('CF1001'); }],
    ['instock-rollback', '入庫回朔', async () => { await adminPick('入庫回朔'); await page.locator('main select[name=orderType]').selectOption('normal'); await order('IN2026001'); }],
    ['shrink-rollback', '減肥回朔', async () => { await adminPick('減肥回朔'); await query('CF1001'); }],
    ['files', '檔案總管', async () => { await go('/files'); await page.waitForTimeout(600); }],
  ];

  const measure = () => page.evaluate(() => {
    const visible = (el) => !!(el.offsetParent || el.getClientRects().length);
    // Lines of text in a cell, from the boxes of its text nodes only (not button borders or
    // padding): line tops within 8px of each other are one line.
    const lineInfo = (cell) => {
      const text = cell.innerText.replace(/\s+/g, '');
      if (!text) return null;
      const tops = [];
      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const r of range.getClientRects()) if (r.width > 0 && r.height > 0) tops.push(r.top);
      }
      tops.sort((a, b) => a - b);
      let lines = 0;
      let last = -Infinity;
      for (const top of tops) { if (top - last > 8) { lines++; last = top; } }
      return { text: cell.innerText.trim().replace(/\s+/g, ' '), chars: text.length, lines: Math.max(1, lines) };
    };
    return [...document.querySelectorAll('main table')].filter(visible).map((t) => {
      const head = [...t.querySelectorAll('thead th')].map((th) => th.innerText.trim()).filter(Boolean);
      // the nearest ancestor that scrolls sideways, else the parent
      let box = t.parentElement;
      for (let e = t.parentElement; e && e !== document.body; e = e.parentElement) {
        const ox = getComputedStyle(e).overflowX;
        if (ox === 'auto' || ox === 'scroll') { box = e; break; }
      }
      const cells = [...t.querySelectorAll('th, td')].map(lineInfo).filter(Boolean);
      const squeezed = cells.filter((c) => c.lines >= 2 && c.chars / c.lines <= 1.5);
      const wrapped = cells.filter((c) => c.lines >= 2);
      const rows = [...t.querySelectorAll('tbody tr')].map((r) => Math.round(r.getBoundingClientRect().height));
      const tw = Math.round(t.getBoundingClientRect().width);
      const bw = Math.round(box.getBoundingClientRect().width);
      return {
        head: head.slice(0, 4).join('/') + (head.length > 4 ? `…(${head.length}欄)` : ''),
        table: `${tw}/${bw}${tw > bw + 1 ? ' 橫捲' : ''}`,
        maxRowH: rows.length ? Math.max(...rows) : 0,
        rows: rows.length,
        squeezed: squeezed.length,
        squeezedEg: squeezed.slice(0, 4).map((c) => `${c.text.slice(0, 8)}(${c.lines}行)`).join(' '),
        wrapped: wrapped.length,
        wrappedEg: wrapped.filter((c) => !squeezed.includes(c)).slice(0, 3).map((c) => `${c.text.slice(0, 10)}(${c.lines}行)`).join(' '),
      };
    });
  });

  const out = {};
  const ONLY = null; // e.g. ['modify'] to survey some pages only
  for (const [key, label, open, account = 'admin'] of PAGES) {
    if (ONLY && !ONLY.includes(key)) continue;
    await loginAs(account, account + '123');
    for (const width of [1440, 1200, 992, 700]) {
      await page.setViewportSize({ width, height: 900 });
      try {
        await open();
        await page.mouse.move(width - 1, 899);
        await page.screenshot({ path: `${DIR}${key}-${width}.png`, fullPage: true, animations: 'disabled', caret: 'hide' });
        const tables = await measure();
        out[`${label} @${width}`] = tables.length ? tables : '（沒有可見的表格）';
      } catch (e) {
        out[`${label} @${width}`] = 'ERROR ' + String(e.message).split('\n')[0].slice(0, 100);
      }
    }
  }
  return JSON.stringify(out, null, 1);
}
