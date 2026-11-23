import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Font Awesome 4.7 is bundled from the font-awesome npm package (no CDN), so the app also works on
// an intranet without internet access. A class from a later version (fa-warehouse,
// fa-calendar-alt, ...) renders as nothing, so every fa-* class used in the app must exist in 4.7.

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const indexHtml = read('index.html');
const FA_CSS_IMPORT = 'font-awesome/css/font-awesome.min.css';
const fa47 = new Set(
  readFileSync(join(root, 'src/__tests__/fixtures/fontAwesome47Classes.txt'), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
);

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !name.includes('.stories.') ? [path] : [];
  });

describe('Font Awesome icons', () => {
  test('font-awesome is a dependency pinned to exactly 4.7.0', () => {
    const pkg = JSON.parse(read('package.json')) as { dependencies?: Record<string, string> };
    expect(pkg.dependencies?.['font-awesome']).toBe('4.7.0');
    const installed = JSON.parse(read('node_modules/font-awesome/package.json')) as { version: string };
    expect(installed.version).toBe('4.7.0');
  });

  test('the app entry imports the bundled Font Awesome CSS', () => {
    expect(read('src/index.tsx')).toContain(`import "${FA_CSS_IMPORT}";`);
  });

  test('Storybook preview imports the bundled Font Awesome CSS', () => {
    expect(read('.storybook/preview.tsx')).toContain(`import "${FA_CSS_IMPORT}";`);
  });

  test('index.html and Storybook preview-head no longer load Font Awesome from a CDN', () => {
    const previewHeadPath = '.storybook/preview-head.html';
    const previewHead = existsSync(join(root, previewHeadPath)) ? read(previewHeadPath) : '';
    for (const html of [indexHtml, previewHead]) {
      expect(html).not.toMatch(/font-awesome/i);
      expect(html).not.toContain('cdnjs.cloudflare.com');
    }
  });

  test('every fa-* class used in src exists in Font Awesome 4.7', () => {
    const missing = sourceFiles(join(root, 'src')).flatMap((file) =>
      Array.from(new Set(readFileSync(file, 'utf8').match(/\bfa-[a-z0-9-]+/g) ?? []))
        .filter((name) => !fa47.has(name))
        .map((name) => `${file.replace(root + '/', '')}: ${name}`)
    );
    expect(missing).toEqual([]);
  });
});
