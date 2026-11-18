import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import SearchContainer from '../../../../../components/BO/Stock/OutStockList/SearchContainer';
import type { OutStockInfo } from '../../../../../components/BO/Stock/OutStockList/SearchInfo';
import { appCss, ruleDeclarations } from '../../../../helpers/appCss';

let style: HTMLStyleElement;
beforeAll(() => {
  style = document.createElement('style');
  style.textContent = appCss;
  document.head.appendChild(style);
});
afterAll(() => style.remove());

const makeRow = (overrides: Partial<OutStockInfo> = {}): OutStockInfo => ({
  id: 1,
  productNo: 'CF1001',
  type: '整支',
  quantity: 36,
  unit: '碼',
  reason: '中壢門市調貨',
  createdBy: '王小明',
  handled: false,
  outStockType: 2,
  fileName: 'OutStockList-20261117093015.xls',
  ...overrides,
});

const handlers = {
  allSelectMethod: vi.fn(),
  handleToBeSubmitChange: vi.fn(),
  handleToBeSubmitWHChange: vi.fn(),
  handleDeleteClick: vi.fn(),
  downloadFile: vi.fn(),
  handleModalShow: vi.fn(),
  initialize: vi.fn(),
};

test('headers, cells (出庫原因 too) and download button keep their text on one line inside a scrolling wrapper', () => {
  const { container } = render(
    <SearchContainer
      index={0}
      active
      date="2026-11-17"
      outStockListFiltered={[
        makeRow({ id: 1, handled: false }),
        makeRow({ id: 2, handled: true }),
      ]}
      toBeSubmit={{ 1: { selected: true, whName: '內倉' } }}
      {...handlers}
    />
  );

  const table = container.querySelector('table')!;
  const cells = [...table.querySelectorAll<HTMLElement>('th, td, td button, td .text-cell')];
  expect(cells.length).toBeGreaterThan(15);
  const wrapping = cells.filter((el) => getComputedStyle(el).whiteSpace !== 'nowrap');
  expect(wrapping.map((el) => el.textContent?.trim() || el.tagName)).toEqual([]);
  expect(getComputedStyle(table.parentElement!).overflowX).toBe('auto');
});

// 出庫原因 stays one line, as before the table went nowrap: cut with an ellipsis at 14em (about
// its old 17% column at 1440px) so a long reason cannot stretch the table, and shown in full
// on hover.
test('a long 出庫原因 stays on one line, cut with an ellipsis at 14em, full text in its title', () => {
  const reason = '客戶指定此批貨需於下週一前出貨並附檢驗報告與出貨單據影本，若有延誤請先聯絡業務窗口確認後續處理方式';
  const { container } = render(
    <SearchContainer
      index={0}
      active
      date="2026-11-17"
      outStockListFiltered={[makeRow({ reason })]}
      toBeSubmit={{ 1: { selected: true, whName: '內倉' } }}
      {...handlers}
    />
  );

  expect(container.querySelector('td.stock-remark')).toBeNull();
  const text = container.querySelector<HTMLElement>('.outstock-reason')!;
  expect(text).toHaveTextContent(reason);
  expect(text).toHaveAttribute('title', reason);
  const cs = getComputedStyle(text);
  const em = parseFloat(cs.fontSize);
  expect({
    whiteSpace: cs.whiteSpace,
    overflow: cs.overflow,
    textOverflow: cs.textOverflow,
    maxWidth: cs.maxWidth,
  }).toEqual({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: `${14 * em}px`,
  });
});

test('column widths follow the content (no fixed % widths) and 倉別 select keeps min-width', () => {
  const { container } = render(
    <SearchContainer
      index={0}
      active
      date="2026-11-17"
      outStockListFiltered={[makeRow()]}
      toBeSubmit={{ 1: { selected: true, whName: '內倉' } }}
      {...handlers}
    />
  );

  const fixedWidths = [...container.querySelectorAll<HTMLElement>('thead th')]
    .filter((th) => th.style.width || getComputedStyle(th).width !== 'auto')
    .map((th) => `${th.textContent?.trim() || '(actions)'}: ${th.style.width || getComputedStyle(th).width}`);
  expect(fixedWidths).toEqual([]);
  expect(container.querySelector('colgroup')).toBeNull();

  const select = container.querySelector<HTMLElement>('select.form-select')!;
  expect(parseFloat(getComputedStyle(select).minWidth)).toBeGreaterThanOrEqual(100);
});

// The icon buttons' CSS tooltip (components.css .icon-button::after, content: attr(title)) is an
// absolutely positioned box that stays in the layout while hidden. In the last column of a
// scrolling table it made the box scroll sideways (by the width of 刪除此筆記錄: 2px at 1200px,
// 9px at 992px) and, when shown, it was clipped by the box. Inside .table-responsive it is off;
// the button's own title attribute still shows the native tooltip.
test('icon buttons in a scrolling table use the native title tooltip, not the CSS one', () => {
  const css = readFileSync(join(process.cwd(), 'src/App.css'), 'utf8');
  expect(ruleDeclarations(css, null, '.table-responsive .icon-button::after')).toEqual(['content: none']);

  const { container } = render(
    <SearchContainer
      index={0}
      active
      date="2026-11-17"
      outStockListFiltered={[makeRow({ id: 1, handled: true }), makeRow({ id: 2, handled: false })]}
      toBeSubmit={{}}
      {...handlers}
    />
  );
  const buttons = [...container.querySelectorAll<HTMLElement>('.table-responsive .icon-button')];
  expect(buttons.map((b) => b.getAttribute('title'))).toEqual(['刪除此筆記錄', '取消出貨']);
});

// A handled row's download button shows the file name (fileName minus its 13-character
// 'OutStockList-' prefix, e.g. 20261117093015.xls). It is capped at 10em (140px at 14px) with
// an ellipsis so a real timestamped .xls name shows in full while an unexpectedly long name cannot
// widen the 倉別 column. The title is only the file name: Chrome drops a shorter title that is
// already inside the aria-label, and announces a title that repeats the aria-label a second time.
test('the download button caps the file name at 10em, with the file name as its title', () => {
  const fileName = 'OutStockList-20261117093015.xls';
  const { container } = render(
    <SearchContainer
      index={0}
      active
      date="2026-11-17"
      outStockListFiltered={[makeRow({ id: 1, handled: true, fileName })]}
      toBeSubmit={{}}
      {...handlers}
    />
  );

  const button = container.querySelector<HTMLElement>('button[aria-label^="下載"]')!;
  expect(button).toHaveAttribute('aria-label', '下載 20261117093015.xls');
  expect(button).toHaveAttribute('title', '20261117093015.xls');
  const name = button.querySelector<HTMLElement>('.download-file-name')!;
  expect(name).toHaveTextContent('20261117093015.xls');
  const cs = getComputedStyle(name);
  const em = parseFloat(cs.fontSize);
  expect({
    whiteSpace: cs.whiteSpace,
    overflow: cs.overflow,
    textOverflow: cs.textOverflow,
    maxWidth: cs.maxWidth,
  }).toEqual({ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: `${10 * em}px` });
});

// A real yyyyMMddHHmmss.xls name fits inside 10em. A longer one must stay whole in the button
// (the span is not sliced in script) and keep the same cap: nowrap, hidden, ellipsis, 10em.
// Dropping any of those, or setting min-width: max-content, lets the name widen the 倉別 column.
test('an unexpectedly long download file name stays whole and is still capped at 10em with an ellipsis', () => {
  const visible = '2026111700001OS2026001_中壢門市調撥補貨單.pdf';
  const { container } = render(
    <SearchContainer
      index={0}
      active
      date="2026-11-17"
      outStockListFiltered={[makeRow({ id: 1, handled: true, fileName: `OutStockList-${visible}` })]}
      toBeSubmit={{}}
      {...handlers}
    />
  );

  const name = container.querySelector<HTMLElement>('.download-file-name')!;
  expect(name.textContent).toBe(visible);
  const cs = getComputedStyle(name);
  const em = parseFloat(cs.fontSize);
  expect({
    whiteSpace: cs.whiteSpace,
    overflow: cs.overflow,
    textOverflow: cs.textOverflow,
    maxWidth: cs.maxWidth,
    minWidth: cs.minWidth,
  }).toEqual({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: `${10 * em}px`,
    minWidth: 'auto',
  });
});

// An unhandled row has no file yet (the API sends null). Reading substring on it must not
// throw, or the whole 拉貨明細 list fails to render.
test('a pending row with no file name still renders its warehouse select', () => {
  const { container } = render(
    <SearchContainer
      index={0}
      active
      date="2026-11-17"
      outStockListFiltered={[makeRow({ id: 1, handled: false, fileName: null as unknown as string })]}
      toBeSubmit={{}}
      {...handlers}
    />
  );

  expect(container.querySelector('select[name="whName"]')).toBeTruthy();
  expect(container.querySelector('.download-file-name')).toBeNull();
});
