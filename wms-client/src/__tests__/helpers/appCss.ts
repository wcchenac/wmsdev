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
 * with its design-system imports; App.tsx: App.css), so tests can check computed styles with
 * it. jsdom evaluates @media rules against its fixed 1024px-wide window (changing innerWidth
 * does not re-evaluate them), so a rule for another width has to be checked in the source.
 */
export const appCss = [
  read('node_modules/bootstrap/dist/css/bootstrap.min.css'),
  withImports('src/index.css'),
  read('src/App.css'),
].join('\n');

/**
 * Extracts normalized `property: value` declarations from a CSS file for an exact selector
 * inside either top-level (`media === null`) or a normalized `@media (...)` block.
 * jsdom evaluates `@media` rules only against its fixed 1024px window, so rules targeting
 * other breakpoints are checked in source.
 */
export const ruleDeclarations = (css: string, media: string | null, selector: string): string[] => {
  const rules: Array<[string | null, string, string]> = [];
  const parse = (text: string, within: string | null) => {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i);
      if (open < 0) break;
      const head = text.slice(i, open).trim();
      let depth = 1;
      let j = open + 1;
      for (; depth > 0 && j < text.length; j++) {
        if (text[j] === '{') depth++;
        if (text[j] === '}') depth--;
      }
      const body = text.slice(open + 1, j - 1);
      if (head.startsWith('@media')) parse(body, head.replace(/\s+/g, ' ').replace(/\s*:\s*/g, ': '));
      else rules.push([within, head.replace(/\s+/g, ' '), body]);
      i = j;
    }
  };
  parse(css.replace(/\/\*[\s\S]*?\*\//g, ''), null);
  return rules
    .filter(([m, sel]) => m === media && sel.split(',').some((part) => part.trim() === selector))
    .flatMap(([, , body]) =>
      body
        .split(';')
        .map((d) => d.split(':').map((part) => part.trim().replace(/\s+/g, ' ')))
        .filter(([property, value]) => property && value)
        .map(([property, value]) => `${property}: ${value}`)
    );
};
