import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import StockInfoContainer from '../../../../../../components/BO/Stock/QueryStock/Common/StockInfoContainer';
import type { StockInfo } from '../../../../../../types';
import { appCss, ruleDeclarations } from '../../../../../helpers/appCss';

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
  remark: '入庫回朔示範',
};

test.each([
  ['布料', false],
  ['五金', true],
])('%s: headers and non-remark cells keep their text on one line', (_name, typeValidation) => {
  const { container } = render(
    <StockInfoContainer typeValidation={typeValidation} stockInfoes={[stockInfo]} />
  );

  const table = container.querySelector('table')!;
  const cells = [...table.querySelectorAll<HTMLElement>('th, td')].filter(
    (el) => !el.closest('.stock-remark')
  );
  expect(cells.length).toBeGreaterThan(10);
  const wrapping = cells.filter((el) => getComputedStyle(el).whiteSpace !== 'nowrap');
  expect(wrapping.map((el) => el.textContent?.trim() || el.tagName)).toEqual([]);
  expect(getComputedStyle(table.parentElement!).overflow).toBe('auto');
});

test.each([
  ['布料', false, 14],
  ['五金', true, 8],
])('%s: a long 註解 wraps within its minimum (at jsdom\'s 1024px) and 20em', (_name, typeValidation, minEm) => {
  const remark = '客戶指定此批貨需於下週一前出貨並附檢驗報告與出貨單據影本，若有延誤請先聯絡業務窗口確認後續處理方式';
  const { container } = render(
    <StockInfoContainer
      typeValidation={typeValidation}
      stockInfoes={[{ ...stockInfo, remark }]}
    />
  );

  const cell = container.querySelector<HTMLElement>('td.stock-remark')!;
  expect(cell).toBeTruthy();
  expect(cell).toHaveTextContent(remark);
  const text = cell.querySelector<HTMLElement>('.stock-remark-text')!;
  expect(text).toBeTruthy();
  const em = parseFloat(getComputedStyle(text).fontSize);
  const cs = getComputedStyle(text);
  expect({
    cellWhiteSpace: getComputedStyle(cell).whiteSpace,
    cellVerticalAlign: getComputedStyle(cell).verticalAlign,
    whiteSpace: cs.whiteSpace,
    minWidth: cs.minWidth,
    maxWidth: cs.maxWidth,
    wordBreak: cs.wordBreak,
    overflowWrap: cs.overflowWrap,
    textAlign: cs.textAlign,
  }).toEqual({
    cellWhiteSpace: 'normal',
    cellVerticalAlign: 'top',
    whiteSpace: 'normal',
    minWidth: `${minEm * em}px`,
    maxWidth: `${20 * em}px`,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    textAlign: 'left',
  });
});

test.each([
  ['布料', false],
  ['五金', true],
])('%s: column widths follow the content (no fixed % widths)', (_name, typeValidation) => {
  const { container } = render(
    <StockInfoContainer typeValidation={typeValidation} stockInfoes={[stockInfo]} />
  );

  const fixedWidths = [...container.querySelectorAll<HTMLElement>('thead th')]
    .filter((th) => th.style.width || getComputedStyle(th).width !== 'auto')
    .map((th) => `${th.textContent?.trim()}: ${th.style.width || getComputedStyle(th).width}`);
  expect(fixedWidths).toEqual([]);
  expect(container.querySelector('colgroup')).toBeNull();
});

test('the 註解 minimum width is 8em, 14em in 布料 below 1200px, and 14em in 五金 below 992px', () => {
  const css = readFileSync(join(process.cwd(), 'src/App.css'), 'utf8');

  expect(ruleDeclarations(css, null, '.stock-remark .stock-remark-text')).toContain('min-width: 8em');
  expect(
    ruleDeclarations(
      css,
      '@media (max-width: 1199.98px)',
      '.table:not(.stock-table-hardware) .stock-remark .stock-remark-text'
    )
  ).toEqual(['min-width: 14em']);
  expect(
    ruleDeclarations(
      css,
      '@media (max-width: 991.98px)',
      '.stock-table-hardware .stock-remark .stock-remark-text'
    )
  ).toEqual(['min-width: 14em']);
});

test('the 五金 table is marked so the 布料-only width rule skips it', () => {
  const renderTable = (typeValidation: boolean) =>
    render(<StockInfoContainer typeValidation={typeValidation} stockInfoes={[stockInfo]} />)
      .container.querySelector('table')!;

  expect(renderTable(true)).toHaveClass('stock-table-hardware');
  expect(renderTable(false)).not.toHaveClass('stock-table-hardware');
});

// 註解 is top-aligned so a long remark starts at the top of its cell; the other cells line up
// with it, so a tall row reads as one line across instead of 註解 at the top and the rest in the
// middle. All other cells hold one line of plain text, so ordinary rows look the same.
test.each([
  ['布料', false],
  ['五金', true],
])('%s: every body cell is top-aligned, in line with a long 註解', (_name, typeValidation) => {
  const remark = '客戶指定此批貨需於下週一前出貨並附檢驗報告與出貨單據影本，若有延誤請先聯絡業務窗口確認後續處理方式';
  const { container } = render(
    <StockInfoContainer typeValidation={typeValidation} stockInfoes={[{ ...stockInfo, remark }]} />
  );

  const cells = [...container.querySelectorAll<HTMLElement>('tbody td')];
  expect(cells.length).toBeGreaterThanOrEqual(7);
  const notTop = cells
    .filter((td) => getComputedStyle(td).verticalAlign !== 'top')
    .map((td) => `${td.textContent?.trim()}: ${getComputedStyle(td).verticalAlign}`);
  expect(notTop).toEqual([]);
});
