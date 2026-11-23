async (page) => {
  // Navbar at several widths for Admin and Operator (top of the page), plus the toggler menu
  // opened where the toggler shows. Set LABEL to before|after.
  const LABEL = 'after';
  const DIR = '/Users/wcchenac/wmsdev/.playwright-mcp/navbar-rwd/' + LABEL + '/';
  const BASE = globalThis.__WMS_BASE__ || 'http://localhost:3100';
  const API = globalThis.__WMS_API__ || 'http://localhost:8080';
  const accounts = { admin: ['admin', 'admin123'], operator: ['operator', 'operator123'] };
  const widths = [375, 700, 900, 1100, 1440];
  const out = {};
  for (const [role, [id, pw]] of Object.entries(accounts)) {
    const token = (await (await page.request.post(API + '/api/user/login', { data: { employeeId: id, password: pw } })).json()).accessToken;
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/login', { waitUntil: 'load' });
    await page.evaluate((t) => { localStorage.clear(); localStorage.setItem('jwtToken', t); }, token);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BASE + '/stock/2/2', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      await page.mouse.move(0, 899);
      await page.screenshot({ path: `${DIR}${role}-${width}.png`, clip: { x: 0, y: 0, width, height: 260 }, animations: 'disabled', caret: 'hide' });
      const m = await page.evaluate(() => {
        const nav = document.querySelector('nav.navbar');
        const toggler = document.querySelector('.navbar-toggler');
        const burger = getComputedStyle(toggler).display !== 'none';
        const links = [...nav.querySelectorAll('.nav-link')].filter((l) => l.offsetParent);
        return { burger, navH: Math.round(nav.getBoundingClientRect().height), linkH: Math.max(0, ...links.map((l) => Math.round(l.getBoundingClientRect().height))), overflow: nav.scrollWidth > nav.clientWidth };
      });
      out[`${role}-${width}`] = `${m.burger ? 'burger' : 'bar'} navH=${m.navH} linkH=${m.linkH}${m.overflow ? ' OVERFLOW' : ''}`;
      if (m.burger) {
        await page.locator('.navbar-toggler').click();
        await page.waitForTimeout(400);
        const dd = page.locator('#mobile-nav').getByRole('button', { name: '庫存異動作業' });
        if (await dd.count()) { await dd.click(); await page.waitForTimeout(300); }
        await page.mouse.move(0, 899);
        await page.screenshot({ path: `${DIR}${role}-${width}-menu.png`, fullPage: true, animations: 'disabled', caret: 'hide' });
        out[`${role}-${width}-menu`] = await page.evaluate(() => {
          const c = document.querySelector('#mobile-nav');
          const links = [...c.querySelectorAll('.nav-link, .dropdown-item')].filter((l) => l.offsetParent);
          return `menuH=${Math.round(c.getBoundingClientRect().height)} items=${links.length} maxItemH=${Math.max(...links.map((l) => Math.round(l.getBoundingClientRect().height)))}`;
        });
      }
    }
  }
  return out;
}
