import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ModifyRequestContainer from '../../../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ModifyRequestContainer';
import { DefectOptions, StockIdentifierType } from '../../../../../../enums/Enums';
import type { NewStockInfoItem } from '../../../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ModifyRequestBoard';
import { appCss } from '../../../../../helpers/appCss';

let style: HTMLStyleElement;
beforeAll(() => {
  style = document.createElement('style');
  style.textContent = appCss;
  document.head.appendChild(style);
});
afterAll(() => style.remove());

const makeItem = (typeValidation: boolean): NewStockInfoItem => ({
  productNo: typeValidation ? 'HW9001' : 'CF1001',
  lotNo: 'L2409',
  type: typeValidation ? StockIdentifierType.hardware : StockIdentifierType.roll,
  quantity: '',
  unit: typeValidation ? '個' : '碼',
  color: '1',
  defect: [DefectOptions[0]],
  record: '',
  remark: '',
  inStockType: 'shrink',
  directShip: false,
  outStockReason: '',
  parentId: 1,
  errors: { quantity: '' },
});

const renderContainer = (typeValidation: boolean) =>
  render(
    <ModifyRequestContainer
      typeValidation={typeValidation}
      newStockInfoes={[makeItem(typeValidation)]}
      onRequestChange={vi.fn()}
      handleDefectChange={vi.fn()}
      handleShipCheck={vi.fn()}
      handleReasonButton={vi.fn()}
    />
  );

test.each([
  ['布料', false],
  ['五金', true],
])('%s: headers and cells keep their text on one line inside an overflow-x: auto wrapper', (_label, typeValidation) => {
  const { container } = renderContainer(typeValidation);

  const table = container.querySelector('table')!;
  const cells = [...table.querySelectorAll<HTMLElement>('th, td')];
  expect(cells.length).toBeGreaterThanOrEqual(10);
  const wrapping = cells.filter((el) => getComputedStyle(el).whiteSpace !== 'nowrap');
  expect(wrapping.map((el) => el.textContent?.trim() || el.tagName)).toEqual([]);
  expect(getComputedStyle(table.parentElement!).overflowX).toBe('auto');
});

test.each([
  ['布料', false],
  ['五金', true],
])('%s: column widths follow content (no fixed % widths)', (_label, typeValidation) => {
  const { container } = renderContainer(typeValidation);

  const fixedWidths = [...container.querySelectorAll<HTMLElement>('thead th')]
    .filter((th) => th.style.width || getComputedStyle(th).width !== 'auto')
    .map((th) => `${th.textContent?.trim()}: ${th.style.width || getComputedStyle(th).width}`);
  expect(fixedWidths).toEqual([]);
  expect(container.querySelector('colgroup')).toBeNull();
});

test.each([
  ['布料', false],
  ['五金', true],
])('%s: form inputs and selects keep usable minimum widths', (_label, typeValidation) => {
  const { container } = renderContainer(typeValidation);
  const table = container.querySelector('table')!;

  const inputs = [...table.querySelectorAll<HTMLElement>('input.form-control')];
  expect(inputs.length).toBeGreaterThanOrEqual(2);
  for (const input of inputs) {
    // 80px: the 入庫 Step 3 table then fits its 1084px box at 1200px (100px made it 1157px and
    // scroll), and a value like CF1001 or the 批號/數量/記錄 placeholders still shows in full.
    expect(getComputedStyle(input).minWidth).toBe('80px');
  }

  const selects = [...table.querySelectorAll<HTMLElement>('select.form-select')];
  for (const select of selects) {
    expect(parseFloat(getComputedStyle(select).minWidth)).toBeGreaterThanOrEqual(100);
  }

  if (!typeValidation) {
    const defectSelect = table.querySelector<HTMLElement>('.stock-defect-select');
    expect(defectSelect).toBeTruthy();
    expect(parseFloat(getComputedStyle(defectSelect!).minWidth)).toBeGreaterThanOrEqual(140);
  }
});

// A validation message under 數量 wraps within the input's width instead of widening the table
// (under text-nowrap it stayed one line, e.g. 請輸入純數字或數量不可空白 at 182px).
test.each([
  ['布料', false],
  ['五金', true],
])('%s: a 數量 validation message wraps instead of widening the table', (_label, typeValidation) => {
  const item = { ...makeItem(typeValidation), quantity: 'abc', errors: { quantity: '請輸入純數字或數量不可空白' } };
  const { container } = render(
    <ModifyRequestContainer
      typeValidation={typeValidation}
      newStockInfoes={[item]}
      onRequestChange={vi.fn()}
      handleDefectChange={vi.fn()}
      handleShipCheck={vi.fn()}
      handleReasonButton={vi.fn()}
    />
  );

  const feedback = container.querySelector<HTMLElement>('table .invalid-feedback');
  expect(feedback).toHaveTextContent('請輸入純數字或數量不可空白');
  expect(getComputedStyle(feedback!).whiteSpace).toBe('normal');
});

// The 瑕疵 menu opens with position: fixed (react-select menuPosition="fixed"), so the table's
// scroll box (overflow-x: auto) does not clip it.
test('布料: the 瑕疵 menu opens outside the table scroll box (position: fixed)', async () => {
  const { container } = renderContainer(false);
  const select = container.querySelector<HTMLElement>('table .stock-defect-select')!;

  fireEvent.keyDown(select.querySelector('input')!, { key: 'ArrowDown', keyCode: 40 });

  const option = await screen.findByText(DefectOptions[2].label);
  let fixed: HTMLElement | null = option;
  while (fixed && getComputedStyle(fixed).position !== 'fixed') fixed = fixed.parentElement;
  expect(fixed).not.toBeNull();
  expect(select.contains(fixed)).toBe(true);
});
