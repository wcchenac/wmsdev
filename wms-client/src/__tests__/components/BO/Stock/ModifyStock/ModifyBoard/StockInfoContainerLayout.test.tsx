import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import StockInfoContainer from '../../../../../../components/BO/Stock/ModifyStock/ModifyBoard/StockInfoContainer';
import type { StockInfo } from '../../../../../../types';
import { appCss, ruleDeclarations } from '../../../../../helpers/appCss';

// The 庫存異動 table needs about 1060px. In a narrower container (700px wide window) a 100%-wide
// table squeezed its columns until headers and values broke into one character per line and the
// three row actions stacked (rows 259px tall). Cells keep their text on one line instead, so the
// table keeps its natural width and its scroll box (.scrollbar-70, overflow: auto) scrolls
// sideways.

let style: HTMLStyleElement;
beforeAll(() => {
  style = document.createElement('style');
  style.textContent = appCss;
  document.head.appendChild(style);
});
afterAll(() => style.remove());

const stockInfo: StockInfo = {
  id: 1,
  stockIdentifier: {
    id: 1,
    productNo: 'CF1001',
    lotNo: 'L2409',
    type: '板卷',
    quantity: 36,
    unit: '碼',
    firstInStockAt: '2026-10-01',
    waitToShrink: false,
  },
  color: 2,
  defect: '',
  remark: 'A區',
};

test.each([
  ['布料', false],
  ['五金', true],
])('%s: headers, cells and row actions keep their text on one line', (_name, typeValidation) => {
  const { container } = render(
    <StockInfoContainer
      typeValidation={typeValidation}
      stockInfoes={[stockInfo]}
      handleShip={vi.fn()}
      handleShrink={vi.fn()}
      handleStockInfoUpdate={vi.fn()}
    />
  );

  const table = container.querySelector('table')!;
  // 註解 is free text (up to 255 characters) and wraps within its own limits; see below.
  const cells = [...table.querySelectorAll<HTMLElement>('th, td, td button')].filter(
    (el) => !el.closest('.stock-remark')
  );
  expect(cells.length).toBeGreaterThan(10);
  const wrapping = cells.filter((el) => getComputedStyle(el).whiteSpace !== 'nowrap');
  expect(wrapping.map((el) => el.textContent?.trim() || el.tagName)).toEqual([]);
  // The scroll box the table overflows into.
  expect(getComputedStyle(table.parentElement!).overflow).toBe('auto');
});

// 註解 is free text (a plain input, up to 255 characters in the backend). On one line a long
// remark would stretch the table far past the window, even at 1440px, and push every row's
// 詳細資料 / 減肥 / 出庫 buttons out of view. It wraps instead, at most 20em wide and at least 8em;
// in the 布料 layout at least 14em below 1200px (see the App.css test below). jsdom's window is
// 1024px wide, so 布料 gets 14em here and 五金 8em.
test.each([
  ['布料', false, 14],
  ['五金', true, 8],
])('%s: a long 註解 wraps within its minimum (at jsdom\'s 1024px) and 20em', (_name, typeValidation, minEm) => {
  const remark = '客戶指定此批貨需於下週一前出貨並附檢驗報告與出貨單據影本，若有延誤請先聯絡業務窗口確認後續處理方式';
  const { container } = render(
    <StockInfoContainer
      typeValidation={typeValidation}
      stockInfoes={[{ ...stockInfo, remark }]}
      handleShip={vi.fn()}
      handleShrink={vi.fn()}
      handleStockInfoUpdate={vi.fn()}
    />
  );

  const cell = container.querySelector<HTMLElement>('td.stock-remark')!;
  expect(cell).toHaveTextContent(remark);
  const text = cell.querySelector<HTMLElement>('button')!;
  const em = parseFloat(getComputedStyle(text).fontSize);
  const cs = getComputedStyle(text);
  expect({
    cellWhiteSpace: getComputedStyle(cell).whiteSpace,
    whiteSpace: cs.whiteSpace,
    minWidth: cs.minWidth,
    maxWidth: cs.maxWidth,
    overflowWrap: cs.overflowWrap,
  }).toEqual({
    cellWhiteSpace: 'normal',
    whiteSpace: 'normal',
    minWidth: `${minEm * em}px`,
    maxWidth: `${20 * em}px`,
    overflowWrap: 'anywhere',
  });
});

// With fixed percentage widths on the headers (註解 13% / 15%), the browser gave 註解 only its
// share and the remark stayed near its 8em minimum: a 255-character remark made a 929px row,
// taller than the 630px scroll box. Without them the columns size to their content and the
// remark can use up to 20em. A tall remark starts at the top of its cell, and long unspaced
// strings (product numbers, URLs) break where overflow-wrap: anywhere is not supported.
test.each([
  ['布料', false],
  ['五金', true],
])('%s: column widths follow the content; 註解 and the row actions align to the top', (_name, typeValidation) => {
  const { container } = render(
    <StockInfoContainer
      typeValidation={typeValidation}
      stockInfoes={[stockInfo]}
      handleShip={vi.fn()}
      handleShrink={vi.fn()}
      handleStockInfoUpdate={vi.fn()}
    />
  );

  // Inline or class-given (e.g. Bootstrap's w-25), any width other than auto counts, and so
  // does a <colgroup>.
  const fixedWidths = [...container.querySelectorAll<HTMLElement>('thead th')]
    .filter((th) => th.style.width || getComputedStyle(th).width !== 'auto')
    .map((th) => `${th.textContent?.trim() || '(actions)'}: ${th.style.width || getComputedStyle(th).width}`);
  expect(fixedWidths).toEqual([]);
  expect(container.querySelector('colgroup')).toBeNull();

  const cell = container.querySelector<HTMLElement>('td.stock-remark')!;
  const text = cell.querySelector<HTMLElement>('button')!;
  expect({
    cellVerticalAlign: getComputedStyle(cell).verticalAlign,
    wordBreak: getComputedStyle(text).wordBreak,
    overflowWrap: getComputedStyle(text).overflowWrap,
  }).toEqual({ cellVerticalAlign: 'top', wordBreak: 'break-word', overflowWrap: 'anywhere' });

  // The row's 詳細資料 / 減肥 / 出庫 stay at the top of a tall row, next to where the remark starts.
  const actions = container.querySelector<HTMLElement>('tbody tr td:last-child')!;
  expect(actions).toHaveTextContent('詳細資料');
  expect(getComputedStyle(actions).verticalAlign).toBe('top');
});

// Below 1200px the 布料 table (9 columns) is wider than its box and scrolls sideways, and the
// browser shrinks every column to its minimum: at 8em a 255-character remark made a 929px row
// (521px at 14em). From 1200px it fits at 8em, and 14em would make it scroll. The 五金 table (7
// columns) fits its 936px box at 992-1199px with 8em but not with 14em (1018px), so it keeps 8em.
// jsdom evaluates @media only at its fixed 1024px width, so this reads App.css (ruleDeclarations
// from helpers/appCss.ts; formatting and declaration order do not matter).
test('the 註解 minimum width is 8em, and 14em in the 布料 layout below 1200px', () => {
  const css = readFileSync(join(process.cwd(), 'src/App.css'), 'utf8');

  expect(ruleDeclarations(css, null, '.stock-remark .btn-customize')).toContain('min-width: 8em');
  expect(
    ruleDeclarations(
      css,
      '@media (max-width: 1199.98px)',
      '.table:not(.stock-table-hardware) .stock-remark .btn-customize'
    )
  ).toEqual(['min-width: 14em']);
});

// Below 992px the 五金 table scrolls sideways even at 8em (922px in a 696px box), so the wider
// minimum costs nothing there and keeps a 255-character remark's row shorter.
test('the 五金 註解 minimum width is 14em below 992px', () => {
  const css = readFileSync(join(process.cwd(), 'src/App.css'), 'utf8');

  expect(
    ruleDeclarations(css, '@media (max-width: 991.98px)', '.stock-table-hardware .stock-remark .btn-customize')
  ).toEqual(['min-width: 14em']);
});

// A long 註解 is already top-aligned. The other cells used to stay in the middle, so a tall row
// read as 註解 at the top and 貨號 / 批號 / 數量 beside its middle. Every body cell starts at the
// top, in line with 註解; ordinary rows hold one line, so they look the same.
test.each([
  ['布料', false],
  ['五金', true],
])('%s: every body cell is top-aligned, in line with a long 註解', (_name, typeValidation) => {
  const remark = '客戶指定此批貨需於下週一前出貨並附檢驗報告與出貨單據影本，若有延誤請先聯絡業務窗口確認後續處理方式';
  const { container } = render(
    <StockInfoContainer
      typeValidation={typeValidation}
      stockInfoes={[{ ...stockInfo, remark }]}
      handleShip={vi.fn()}
      handleShrink={vi.fn()}
      handleStockInfoUpdate={vi.fn()}
    />
  );

  const cells = [...container.querySelectorAll<HTMLElement>('tbody td')];
  expect(cells.length).toBeGreaterThanOrEqual(7);
  const notTop = cells
    .filter((td) => getComputedStyle(td).verticalAlign !== 'top')
    .map((td) => `${td.textContent?.trim()}: ${getComputedStyle(td).verticalAlign}`);
  expect(notTop).toEqual([]);
});

test('the 五金 table is marked so the 布料-only width rule skips it', () => {
  const renderTable = (typeValidation: boolean) =>
    render(
      <StockInfoContainer
        typeValidation={typeValidation}
        stockInfoes={[stockInfo]}
        handleShip={vi.fn()}
        handleShrink={vi.fn()}
        handleStockInfoUpdate={vi.fn()}
      />
    ).container.querySelector('table')!;

  expect(renderTable(true)).toHaveClass('stock-table-hardware');
  expect(renderTable(false)).not.toHaveClass('stock-table-hardware');
});
