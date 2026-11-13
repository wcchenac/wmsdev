async (page) => {
  // Writes compare/<name>.png: the BEFORE crop stacked over the AFTER crop.
  // Edit ITEMS to choose screenshots and crop boxes [name, x0, y0, x1, y1].
  const ITEMS = [
    ['31-modify-info-modal', 400, 190, 1000, 290],
    ['34-modify-product-info', 250, 100, 1140, 200],
    ['51-pull-period-modal', 400, 310, 1000, 410],
    ['20-query-stock', 150, 60, 700, 180],
    ['30-modify', 0, 240, 1440, 680],
  ];
  const ROOT = 'http://127.0.0.1:8765';
  const OUT = '/Users/wcchenac/wmsdev/.playwright-mcp/compare/';
  await page.setViewportSize({ width: 1500, height: 1200 });
  await page.goto(ROOT + '/', { waitUntil: 'load' });
  for (const [n, x0, y0, x1, y1] of ITEMS) {
    await page.evaluate(async ({ n, x0, y0, x1, y1 }) => {
      const load = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = src + '?' + Date.now(); });
      const a = await load('/before/' + n + '.png'), b = await load('/after/' + n + '.png');
      const w = x1 - x0, h = Math.min(y1, a.height, b.height) - y0, gap = 24;
      const c = document.createElement('canvas'); c.id = 'cmp'; c.width = w; c.height = h * 2 + gap * 2;
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = '#c00'; x.font = 'bold 16px sans-serif'; x.fillText('BEFORE  ' + n, 4, 17); x.fillText('AFTER', 4, h + gap + 17);
      x.drawImage(a, x0, y0, w, h, 0, gap, w, h); x.drawImage(b, x0, y0, w, h, 0, h + gap * 2, w, h);
      document.body.innerHTML = ''; document.body.style.margin = '0'; document.body.appendChild(c);
    }, { n, x0, y0, x1, y1 });
    await page.locator('#cmp').screenshot({ path: OUT + n + '.png' });
  }
  return ITEMS.length + ' comparisons written to ' + OUT;
}
