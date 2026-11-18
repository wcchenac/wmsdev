import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mediaBlocks, ruleDeclarations } from './helpers/appCss';

describe('CSS load order and scoped table action selector', () => {
  const srcDir = join(process.cwd(), 'src');

  test('loads bootstrap CSS once before custom index.css and App.css without duplicate subpage CSS imports', () => {
    const indexSource = readFileSync(join(srcDir, 'index.tsx'), 'utf8');
    const appSource = readFileSync(join(srcDir, 'App.tsx'), 'utf8');
    const storybookPreviewSource = readFileSync(join(process.cwd(), '.storybook', 'preview.tsx'), 'utf8');

    const bootstrapToken = "bootstrap/dist/css/bootstrap.min.css";
    expect(indexSource.indexOf(bootstrapToken)).toBeGreaterThan(-1);
    expect(indexSource.indexOf(bootstrapToken)).toBeLessThan(indexSource.indexOf('./index.css'));
    expect(indexSource.indexOf('./index.css')).toBeLessThan(indexSource.indexOf('./App'));

    // App.tsx should not duplicate bootstrap CSS already loaded in index.tsx, and owns ToastContainer CSS.
    expect(appSource).not.toContain(bootstrapToken);
    expect(appSource).toContain('react-toastify/dist/ReactToastify.css');
    expect(appSource).toContain('./App.css');

    for (const subpage of [
      'components/BO/User/AdminPlatform/ScheduleMission.tsx',
      'components/BO/User/AdminPlatform/InStockByImportFile.tsx',
      'components/BO/User/AdminPlatform/SetWarehouse.tsx',
      'components/BO/User/AdminPlatform/UserRegister.tsx',
    ]) {
      expect(readFileSync(join(srcDir, subpage), 'utf8')).not.toContain('ReactToastify.css');
    }

    const previewBootstrap = storybookPreviewSource.indexOf(bootstrapToken);
    const previewIndex = storybookPreviewSource.indexOf('../src/index.css');
    const previewApp = storybookPreviewSource.indexOf('../src/App.css');
    expect(previewBootstrap).toBeGreaterThan(-1);
    expect(previewBootstrap).toBeLessThan(previewIndex);
    expect(previewIndex).toBeLessThan(previewApp);
  });

  // App.css loads after Bootstrap. Its small-screen modal spacing must go through Bootstrap's
  // --bs-modal-margin: a plain .modal-dialog margin there either beat Bootstrap's auto side
  // margins (dialogs at the left edge on tablets) or disagreed with the
  // calc(100% - 2 * --bs-modal-margin) height of centred and scrollable dialogs (16px of extra
  // scroll at 375px).
  test.each([
    ['App.css', '@media (min-width: 576px) and (max-width: 768px)', 'var(--spacing-4)'],
    ['styles/utilities.css', '@media (max-width: 575.98px)', 'var(--spacing-2)'],
  ])('%s %s sets --bs-modal-margin: %s and no .modal-dialog margin', (file, header, value) => {
    const css = readFileSync(join(srcDir, file), 'utf8');
    const blocks = mediaBlocks(css, header);
    expect(blocks.length).toBeGreaterThan(0);

    expect(ruleDeclarations(css, header, '.modal')).toContain(`--bs-modal-margin: ${value}`);
    expect(ruleDeclarations(css, header, '.modal-dialog')).toEqual([]);
  });

  // App.css loads after utilities.css, so a tablet rule that also covers phones would override
  // the phone spacing.
  test('App.css does not set --bs-modal-margin below 576px', () => {
    const appCssSource = readFileSync(join(srcDir, 'App.css'), 'utf8');
    const blocks = mediaBlocks(appCssSource, '@media (max-width: 768px)');
    expect(blocks.length).toBeGreaterThan(0);

    expect(
      ruleDeclarations(appCssSource, '@media (max-width: 768px)', '.modal')
        .filter((decl) => decl.startsWith('--bs-modal-margin:'))
    ).toEqual([]);
  });

  test('scopes centered last-column cell styling to .table.table-actions-center and drops !important btn-customize / global flex .alert', () => {
    const componentsCss = readFileSync(join(srcDir, 'styles', 'components.css'), 'utf8');
    const utilitiesCss = readFileSync(join(srcDir, 'styles', 'utilities.css'), 'utf8');

    expect(
      ruleDeclarations(componentsCss, null, '.table.table-actions-center tbody tr td:last-child').length
    ).toBeGreaterThan(0);
    expect(ruleDeclarations(componentsCss, null, '.table tbody tr td:last-child')).toEqual([]);
    expect(ruleDeclarations(componentsCss, null, '.btn-customize')).toEqual([]);
    expect(ruleDeclarations(utilitiesCss, null, '.alert')).not.toContain('display: flex');
  });
});
