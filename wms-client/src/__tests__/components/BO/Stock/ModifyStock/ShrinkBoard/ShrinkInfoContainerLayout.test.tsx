import React from 'react';
import { render } from '@testing-library/react';
import ShrinkInfoContainer from '../../../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkInfoContainer';
import { StockIdentifierType } from '../../../../../../enums/Enums';
import type { StockInfo } from '../../../../../../types';
import { appCss } from '../../../../../helpers/appCss';

let style: HTMLStyleElement;
beforeAll(() => {
  style = document.createElement('style');
  style.textContent = appCss;
  document.head.appendChild(style);
});
afterAll(() => style.remove());

const makeStockInfo = (type: string): StockInfo => ({
  id: 1,
  stockIdentifier: {
    id: 1,
    productNo: 'CF1001',
    lotNo: 'L2409',
    type,
    quantity: 36,
    unit: '碼',
  },
  color: 2,
  defect: '',
});

test.each([
  ['整支', StockIdentifierType.roll],
  ['板卷', StockIdentifierType.board],
  ['雜項', StockIdentifierType.hardware],
])('%s: headers, cells and row buttons keep their text on one line inside an overflow: auto box', (_label, type) => {
  const { container } = render(
    <ShrinkInfoContainer
      shrinkList={[makeStockInfo(type)]}
      onModifyClick={vi.fn()}
      onCancelShrinkClick={vi.fn()}
    />
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
    <ShrinkInfoContainer
      shrinkList={[makeStockInfo(StockIdentifierType.roll)]}
      onModifyClick={vi.fn()}
      onCancelShrinkClick={vi.fn()}
    />
  );

  const fixedWidths = [...container.querySelectorAll<HTMLElement>('thead th')]
    .filter((th) => th.style.width || getComputedStyle(th).width !== 'auto')
    .map((th) => `${th.textContent?.trim() || '(actions)'}: ${th.style.width || getComputedStyle(th).width}`);
  expect(fixedWidths).toEqual([]);
  expect(container.querySelector('colgroup')).toBeNull();
});
