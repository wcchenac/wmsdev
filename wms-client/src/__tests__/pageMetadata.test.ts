import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The browser tab, bookmarks and an installed app use these names; they used to be the
// Create React App placeholders ("React App", "Create React App Sample").

const root = process.cwd();
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const manifest = JSON.parse(readFileSync(join(root, 'public/manifest.json'), 'utf8')) as {
  short_name: string;
  name: string;
};

describe('page metadata', () => {
  // The UI is Traditional Chinese (Taiwan); screen readers and the browser's font choice use this.
  test('the document language is Traditional Chinese (Taiwan)', () => {
    expect(indexHtml).toMatch(/<html lang="zh-Hant-TW">/);
  });

  test('the page title is the app name shown in the navbar', () => {
    expect(indexHtml).toMatch(/<title>庫存管理工具<\/title>/);
  });

  test('the description says what the app is for', () => {
    const description = indexHtml.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1];
    expect(description).toBe('庫存管理工具：入庫、庫存查詢、出庫與庫存異動作業');
  });

  test('the web app manifest uses the app name', () => {
    expect(manifest.name).toBe('庫存管理工具');
    expect(manifest.short_name).toBe('庫存管理');
  });

  test('no Create React App placeholders are left', () => {
    for (const text of [indexHtml, JSON.stringify(manifest)]) {
      expect(text).not.toMatch(/React App|create-react-app/i);
    }
  });
});
