async (page) => {
  // Compares before/<name>.png with after/<name>.png for every screenshot in before/.
  // Needs a static server on 127.0.0.1:8765 rooted at the folder holding before/ and after/.
  const ROOT = 'http://127.0.0.1:8765';
  await page.goto(ROOT + '/before/', { waitUntil: 'load' });
  const names = await page.$$eval('a', as => as.map(a => a.getAttribute('href')).filter(h => h.endsWith('.png')).map(h => decodeURIComponent(h).replace(/\.png$/, '')));
  const res = await page.evaluate(async (names) => {
    const load = src => new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => bad(src); i.src = src + '?' + Date.now(); });
    const data = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height); };
    const out = [];
    for (const n of names) {
      let a, b;
      try { a = await load('/before/' + n + '.png'); b = await load('/after/' + n + '.png'); } catch (e) { out.push({ n, missing: String(e) }); continue; }
      if (a.width !== b.width || a.height !== b.height) { out.push({ n, sizeChange: `${a.width}x${a.height} -> ${b.width}x${b.height}` }); continue; }
      const da = data(a).data, db = data(b).data; let cnt = 0, minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
      for (let p = 0; p < da.length; p += 4) {
        if (Math.abs(da[p] - db[p]) + Math.abs(da[p + 1] - db[p + 1]) + Math.abs(da[p + 2] - db[p + 2]) > 24) {
          cnt++; const px = (p / 4) % a.width, py = Math.floor(p / 4 / a.width);
          if (px < minX) minX = px; if (py < minY) minY = py; if (px > maxX) maxX = px; if (py > maxY) maxY = py;
        }
      }
      out.push(cnt ? { n, changedPx: cnt, box: `x${minX}-${maxX} y${minY}-${maxY}` } : { n, identical: true });
    }
    return out;
  }, names);
  const changed = res.filter(r => !r.identical);
  return JSON.stringify({ compared: res.length, identical: res.length - changed.length, changed }, null, 1);
}
