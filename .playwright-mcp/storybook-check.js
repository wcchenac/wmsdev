async (page) => {
  // Opens every story in the running Storybook (npm run storybook, port 6006) and reports the
  // ones that fail. A story fails on an uncaught page error, Storybook's error display, a render
  // that never reaches the "finished" phase, or any console error. Storybook 10 reports a failed
  // play function only as a console error (the phase is still "finished"), so console errors
  // are what catch broken play assertions.
  const SB = 'http://localhost:6006';
  const index = await (await page.request.get(SB + '/index.json')).json();
  const ids = Object.values(index.entries).filter(e => e.type === 'story').map(e => e.id);
  const failed = [];
  let withPlay = 0;

  for (const id of ids) {
    const errors = [];
    const onPageError = e => errors.push('pageerror: ' + e.message.split('\n')[0].slice(0, 200));
    const onConsole = m => { if (m.type() === 'error') errors.push('console: ' + m.text().split('\n')[0].slice(0, 200)); };
    page.on('pageerror', onPageError);
    page.on('console', onConsole);

    await page.goto(`${SB}/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
    let phase;
    let hasPlay = false;
    for (let t = 0; t < 60; t++) {
      [phase, hasPlay] = await page.evaluate(() => {
        const render = window.__STORYBOOK_PREVIEW__?.storyRenders?.[0];
        return [render?.phase, Boolean(render?.story?.playFunction)];
      });
      if (phase === 'finished' || phase === 'errored' || phase === 'aborted') break;
      await page.waitForTimeout(150);
    }
    // Let late console errors from the play function arrive.
    await page.waitForTimeout(300);
    const errorDisplay = await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay'));

    page.off('pageerror', onPageError);
    page.off('console', onConsole);

    if (hasPlay) withPlay++;
    if (errors.length || errorDisplay || phase !== 'finished') {
      failed.push({ id, phase, errorDisplay, errors });
    }
  }

  return JSON.stringify({ total: ids.length, withPlay, passed: ids.length - failed.length, failed }, null, 1);
}
