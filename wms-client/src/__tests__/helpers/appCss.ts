import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import postcss, { AtRule, Node, Rule } from 'postcss';

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

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();
const normalizeMediaHeader = (header: string): string =>
  normalizeWhitespace(header).replace(/\s*:\s*/g, ': ');

const mediaHeaderOf = (rule: Rule): string | null => {
  let parent: Node | undefined = rule.parent;
  while (parent) {
    if (parent.type === 'atrule' && (parent as AtRule).name === 'media') {
      return normalizeMediaHeader(`@media ${(parent as AtRule).params}`);
    }
    parent = parent.parent;
  }
  return null;
};

/**
 * Extracts top-level `@media` rule bodies whose header matches `mediaHeader` via PostCSS AST.
 */
export const mediaBlocks = (css: string, mediaHeader: string): string[] => {
  const target = normalizeMediaHeader(mediaHeader);
  const root = postcss.parse(css);
  const blocks: string[] = [];

  root.walkAtRules('media', (atRule) => {
    if (normalizeMediaHeader(`@media ${atRule.params}`) === target) {
      blocks.push((atRule.nodes ?? []).map((node) => node.toString()).join('\n'));
    }
  });

  return blocks;
};

/**
 * Extracts normalized `property: value` declarations from a CSS file for an exact selector
 * inside either top-level (`media === null`) or a normalized `@media (...)` block via PostCSS AST.
 * jsdom evaluates `@media` rules only against its fixed 1024px window, so rules targeting
 * other breakpoints are checked in source.
 */
export const ruleDeclarations = (css: string, media: string | null, selector: string): string[] => {
  const normalizedMedia = media ? normalizeMediaHeader(media) : null;
  const normalizedSelector = normalizeWhitespace(selector);
  const root = postcss.parse(css);
  const declarations: string[] = [];

  root.walkRules((rule) => {
    if (mediaHeaderOf(rule) !== normalizedMedia) return;
    const matchesSelector = rule.selectors.some(
      (part) => normalizeWhitespace(part) === normalizedSelector
    );
    if (!matchesSelector) return;

    rule.each((node) => {
      if (node.type === 'decl') {
        declarations.push(`${node.prop.trim()}: ${normalizeWhitespace(node.value)}`);
      }
    });
  });

  return declarations;
};
