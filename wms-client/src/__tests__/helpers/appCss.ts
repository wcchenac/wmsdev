import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

// A stylesheet with its @import rules replaced by the imported files (recursively, resolved
// from the importing file), as the browser applies them, so a new import in index.css is
// picked up here too. Any @import this cannot read fails the test.
const withImports = (path: string): string =>
  read(path).replace(/^@import[^;]*;/gm, (rule) => {
    const target = rule.match(/^@import\s+(?:url\()?\s*['"]([^'"]+)['"]\s*\)?\s*;$/);
    if (!target) throw new Error(`appCss cannot read ${path}: ${rule}`);
    return withImports(join(dirname(path), target[1]));
  });

/**
 * The app's global CSS in the order the browser gets it (index.tsx: Bootstrap, then index.css
 * with its design-system imports; App.tsx: App.css). jsdom applies rules outside @media
 * blocks, so tests can check computed styles with it.
 */
export const appCss = [
  read('node_modules/bootstrap/dist/css/bootstrap.min.css'),
  withImports('src/index.css'),
  read('src/App.css'),
].join('\n');
