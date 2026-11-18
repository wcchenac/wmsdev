import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('CSS load order and scoped table action selector', () => {
  const srcDir = join(process.cwd(), 'src');

  test('loads bootstrap CSS before custom index.css and App.css', () => {
    const indexSource = readFileSync(join(srcDir, 'index.tsx'), 'utf8');
    const appSource = readFileSync(join(srcDir, 'App.tsx'), 'utf8');

    const bootstrapToken = "bootstrap/dist/css/bootstrap.min.css";
    expect(indexSource.indexOf(bootstrapToken)).toBeGreaterThan(-1);
    expect(indexSource.indexOf(bootstrapToken)).toBeLessThan(indexSource.indexOf('./index.css'));

    expect(appSource.indexOf(bootstrapToken)).toBeGreaterThan(-1);
    expect(appSource.indexOf(bootstrapToken)).toBeLessThan(appSource.indexOf('./App.css'));
  });

  // App.css loads after Bootstrap. Its small-screen modal spacing must go through Bootstrap's
  // --bs-modal-margin: a plain .modal-dialog margin there either beat Bootstrap's auto side
  // margins (dialogs at the left edge on tablets) or disagreed with the
  // calc(100% - 2 * --bs-modal-margin) height of centred and scrollable dialogs (16px of extra
  // scroll at 375px).
  // Every block under this media query header in the file, joined.
  const mediaBlocks = (css: string, header: string): string => {
    const blocks: string[] = [];
    for (let head = css.indexOf(header); head > -1; head = css.indexOf(header, head + 1)) {
      let depth = 0;
      let end = css.indexOf('{', head);
      do {
        if (css[end] === '{') depth++;
        if (css[end] === '}') depth--;
        end++;
      } while (depth > 0);
      blocks.push(css.slice(head, end));
    }
    expect(blocks.length).toBeGreaterThan(0);
    return blocks.join('\n');
  };
  const setsModalMargin = (block: string, value: string) =>
    new RegExp(`(^|[\\s}])\\.modal\\s*\\{[^}]*--bs-modal-margin:\\s*${value.replace(/[()]/g, '\\$&')}\\s*;`).test(block);

  test.each([
    ['App.css', '@media (min-width: 576px) and (max-width: 768px)', 'var(--spacing-4)'],
    ['styles/utilities.css', '@media (max-width: 575.98px)', 'var(--spacing-2)'],
  ])('%s %s sets --bs-modal-margin: %s and no .modal-dialog margin', (file, header, value) => {
    const block = mediaBlocks(readFileSync(join(srcDir, file), 'utf8'), header);

    expect(setsModalMargin(block, value)).toBe(true);
    expect(block).not.toMatch(/\.modal-dialog\s*\{/);
  });

  // App.css loads after utilities.css, so a tablet rule that also covers phones would override
  // the phone spacing.
  test('App.css does not set --bs-modal-margin below 576px', () => {
    const block = mediaBlocks(readFileSync(join(srcDir, 'App.css'), 'utf8'), '@media (max-width: 768px)');

    expect(block).not.toContain('--bs-modal-margin');
  });

  test('scopes centered last-column cell styling to .table.table-actions-center', () => {
    const componentsCss = readFileSync(join(srcDir, 'styles', 'components.css'), 'utf8');

    expect(componentsCss).toContain('.table.table-actions-center tbody tr td:last-child');
    expect(componentsCss).not.toMatch(/(^|\n)\.table\s+tbody\s+tr\s+td:last-child/);
  });
});
