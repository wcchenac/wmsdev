import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import StockInfoContainer from '../../../../../../components/BO/Stock/InStock/Common/StockInfoContainer';
import { DefectOptions, StockIdentifierType } from '../../../../../../enums/Enums';
import { appCss } from '../../../../../helpers/appCss';

let style: HTMLStyleElement;
beforeAll(() => {
  style = document.createElement('style');
  style.textContent = appCss;
  document.head.appendChild(style);
});
afterAll(() => style.remove());

const renderDetailTable = (typeValidation: boolean) => {
  const waitHandleStatus = typeValidation
    ? { [StockIdentifierType.hardware]: { quantity: '30', unit: '個' } }
    : { [StockIdentifierType.roll]: { quantity: '30', unit: '碼' } };

  const rendered = render(
    <StockInfoContainer
      sequence={0}
      index={0}
      productNo={typeValidation ? 'HW9001' : 'CF1001'}
      typeValidation={typeValidation}
      waitHandleStatus={waitHandleStatus}
      isLoading={false}
      type="normal"
      orderNo="IN2026001"
      handleInStockRequestSubmit={vi.fn()}
    />
  );

  // The lower detail table ends with 直出 (table-actions-center); the upper 待入庫總量 table is fine.
  const tables = [...rendered.container.querySelectorAll('table')];
  const detailTable = tables.find((t) =>
    [...t.querySelectorAll('thead th')].some((th) => th.textContent?.trim() === '直出')
  )!;
  return { ...rendered, detailTable };
};

test.each([
  ['布料', false],
  ['五金', true],
])('%s: lower detail table headers and cells keep their text on one line inside an overflow-x: auto wrapper', (_label, typeValidation) => {
  const { detailTable } = renderDetailTable(typeValidation);

  const cells = [...detailTable.querySelectorAll<HTMLElement>('th, td')];
  expect(cells.length).toBeGreaterThan(10);
  const wrapping = cells.filter((el) => getComputedStyle(el).whiteSpace !== 'nowrap');
  expect(wrapping.map((el) => el.textContent?.trim() || el.tagName)).toEqual([]);
  expect(getComputedStyle(detailTable.parentElement!).overflowX).toBe('auto');
});

test.each([
  ['布料', false],
  ['五金', true],
])('%s: lower detail table column widths follow content (no fixed % widths)', (_label, typeValidation) => {
  const { detailTable } = renderDetailTable(typeValidation);

  const fixedWidths = [...detailTable.querySelectorAll<HTMLElement>('thead th')]
    .filter((th) => th.style.width || getComputedStyle(th).width !== 'auto')
    .map((th) => `${th.textContent?.trim()}: ${th.style.width || getComputedStyle(th).width}`);
  expect(fixedWidths).toEqual([]);
  expect(detailTable.querySelector('colgroup')).toBeNull();
});

test.each([
  ['布料', false],
  ['五金', true],
])('%s: form inputs and selects inside the detail table keep usable minimum widths', (_label, typeValidation) => {
  const { detailTable } = renderDetailTable(typeValidation);

  const inputs = [...detailTable.querySelectorAll<HTMLElement>('input.form-control')];
  expect(inputs.length).toBeGreaterThanOrEqual(3);
  for (const input of inputs) {
    // 80px: the 入庫 Step 3 table then fits its 1084px box at 1200px (100px made it 1157px and
    // scroll), and a value like CF1001 or the 批號/數量/記錄 placeholders still shows in full.
    expect(getComputedStyle(input).minWidth).toBe('80px');
  }

  const selects = [...detailTable.querySelectorAll<HTMLElement>('select.form-select')];
  for (const select of selects) {
    expect(parseFloat(getComputedStyle(select).minWidth)).toBeGreaterThanOrEqual(100);
  }

  if (!typeValidation) {
    const defectSelect = detailTable.querySelector<HTMLElement>('.stock-defect-select');
    expect(defectSelect).toBeTruthy();
    expect(parseFloat(getComputedStyle(defectSelect!).minWidth)).toBeGreaterThanOrEqual(140);
  }
});

// A validation message under 數量 (e.g. 請輸入純數字或數量不可空白) wraps within the input's width.
// Under the table's text-nowrap it stayed one 182px line, widening the table at 1200px from its
// 1084px box to 1179px and pushing 直出 out of view while the user fixes the value.
test.each([
  ['布料', false],
  ['五金', true],
])('%s: a 數量 validation message wraps instead of widening the table', (_label, typeValidation) => {
  const { detailTable } = renderDetailTable(typeValidation);

  fireEvent.change(detailTable.querySelector('input[name="quantity"]')!, { target: { value: 'abc', name: 'quantity' } });

  const feedback = detailTable.querySelector<HTMLElement>('.invalid-feedback');
  expect(feedback).not.toBeNull();
  expect(feedback!.textContent?.trim()).not.toBe('');
  expect(getComputedStyle(feedback!).whiteSpace).toBe('normal');
});

// The 瑕疵 menu opens with position: fixed (react-select menuPosition="fixed"), so the table's
// scroll box (overflow-x: auto) does not clip it; as an absolute menu inside that box it was cut
// off below the last row.
test('布料: the 瑕疵 menu opens outside the table scroll box (position: fixed)', async () => {
  const { detailTable } = renderDetailTable(false);

  const input = detailTable.querySelector<HTMLInputElement>('.stock-defect-select input')!;
  fireEvent.keyDown(input, { key: 'ArrowDown', keyCode: 40 });

  const option = await screen.findByText(DefectOptions[1].label);
  let fixed: HTMLElement | null = option;
  while (fixed && getComputedStyle(fixed).position !== 'fixed') fixed = fixed.parentElement;
  expect(fixed).not.toBeNull();
  expect(detailTable.querySelector('.stock-defect-select')!.contains(fixed)).toBe(true);
});
