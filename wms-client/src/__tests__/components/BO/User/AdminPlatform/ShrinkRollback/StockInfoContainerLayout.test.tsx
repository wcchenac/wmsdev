import React from 'react';
import { render } from '@testing-library/react';
import StockInfoContainer from '../../../../../../components/BO/User/AdminPlatform/ShrinkRollback/StockInfoContainer';
import type { ShrinkRollbackObject } from '../../../../../../types';
import { appCss } from '../../../../../helpers/appCss';

let style: HTMLStyleElement;
beforeAll(() => {
  style = document.createElement('style');
  style.textContent = appCss;
  document.head.appendChild(style);
});
afterAll(() => style.remove());

const rollbackObject: ShrinkRollbackObject = {
  stockInfo: {
    stockIdentifier: {
      id: 1,
      productNo: 'CF1001',
      lotNo: 'L2409',
      type: '整支',
      quantity: 36,
      unit: '碼',
      eliminateDate: '2026-10-01',
    },
  },
  nodes: [],
};

test('headers, cells and 詳細資料 button keep their text on one line inside an overflow: auto box', () => {
  const { container } = render(
    <StockInfoContainer result={[rollbackObject]} handleShrinkRollback={vi.fn()} />
  );

  const table = container.querySelector('table')!;
  const cells = [...table.querySelectorAll<HTMLElement>('th, td, td button')];
  expect(cells.length).toBeGreaterThan(10);
  const wrapping = cells.filter((el) => getComputedStyle(el).whiteSpace !== 'nowrap');
  expect(wrapping.map((el) => el.textContent?.trim() || el.tagName)).toEqual([]);
  expect(getComputedStyle(table.parentElement!).overflow).toBe('auto');
});

test('column widths follow the content (no fixed % widths)', () => {
  const { container } = render(
    <StockInfoContainer result={[rollbackObject]} handleShrinkRollback={vi.fn()} />
  );

  const fixedWidths = [...container.querySelectorAll<HTMLElement>('thead th')]
    .filter((th) => th.style.width || getComputedStyle(th).width !== 'auto')
    .map((th) => `${th.textContent?.trim() || '(actions)'}: ${th.style.width || getComputedStyle(th).width}`);
  expect(fixedWidths).toEqual([]);
  expect(container.querySelector('colgroup')).toBeNull();
});
