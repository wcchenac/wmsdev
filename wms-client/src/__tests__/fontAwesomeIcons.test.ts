import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// index.html loads Font Awesome 4.7 from a CDN. A class from a later version (fa-warehouse,
// fa-calendar-alt, ...) renders as nothing, so every fa-* class used in the app must exist in 4.7.

const root = process.cwd();
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
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
  test('index.html loads Font Awesome 4.7.0', () => {
    expect(indexHtml).toContain('font-awesome/4.7.0/css/font-awesome.min.css');
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
