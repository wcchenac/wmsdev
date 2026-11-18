import React from 'react';
import { render } from '@testing-library/react';
import StockInfoContainer from '../../../../components/BO/Stock/InStock/Common/StockInfoContainer';
import ModifyRequestBoard from '../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ModifyRequestBoard';
import { StockIdentifierType } from '../../../../enums/Enums';
import type { StockInfo } from '../../../../types';

// The last cell of a table is centred only with `.table-actions-center` (components.css).
// Tables whose last column is the 直出 (direct ship) toggle opt in; tables whose last
// column is data (待入庫總量's 單位) stay left-aligned.

const renderInStock = (typeValidation: boolean) =>
  render(
    <StockInfoContainer
      sequence={0}
      index={0}
      productNo="CF1001"
      typeValidation={typeValidation}
      waitHandleStatus={{ [StockIdentifierType.roll]: { quantity: '30.00', unit: '碼' } }}
      isLoading={false}
      type="normal"
      orderNo="IN2026001"
      handleInStockRequestSubmit={vi.fn()}
    />
  );

const renderShrink = () =>
  render(
    <ModifyRequestBoard
      stockInfo={
        {
          color: '1',
          defect: '',
          stockIdentifier: { id: 1, productNo: 'CF1002', lotNo: 'M2510', type: StockIdentifierType.roll, quantity: 28, unit: '碼' },
        } as StockInfo
      }
      typeExchange={false}
      sameTypeModify
      hardwareModify={false}
      handleGoBack={vi.fn()}
      handleModifyRequestSubmit={vi.fn()}
    />
  );

const tablesByLastHeader = (container: HTMLElement) =>
  [...container.querySelectorAll('table')].map((table) => {
    const headers = [...table.querySelectorAll('thead th')].map((th) => th.textContent?.trim());
    return { last: headers[headers.length - 1], centred: table.classList.contains('table-actions-center') };
  });

describe.each([
  ['入庫 Step 3, 布料', () => renderInStock(false)],
  ['入庫 Step 3, 五金', () => renderInStock(true)],
  ['減肥申請', renderShrink],
])('%s', (_name, renderBoard) => {
  test('tables ending in 直出 centre that column; tables ending in data do not', () => {
    const { container } = renderBoard();
    const tables = tablesByLastHeader(container);

    expect(tables.some((t) => t.last === '直出')).toBe(true);
    for (const table of tables) {
      expect({ last: table.last, centred: table.centred }).toEqual({
        last: table.last,
        centred: table.last === '直出',
      });
    }
  });
});
