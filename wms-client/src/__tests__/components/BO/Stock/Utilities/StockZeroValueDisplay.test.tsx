import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ShowProductInformation from '../../../../../components/BO/Stock/Utilities/ShowProductInformation';
import ShrinkRollbackStockInfo from '../../../../../components/BO/User/AdminPlatform/ShrinkRollback/StockInfo';

describe('Zero value display in product info modal and shrink rollback row', () => {
  test('ShowProductInformation renders numeric cCost 0 instead of "-"', () => {
    render(
      <ShowProductInformation
        isBasic={false}
        isQuery={true}
        productNo="CF100"
        productInfo={{ productNo: 'CF100', cName: '樣布', cCost: 0 }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '貨號資料' }));

    expect(screen.getByText('成本')).toBeInTheDocument();
    const costLabel = screen.getByText('成本');
    expect(costLabel.nextElementSibling).toHaveTextContent('0');
  });

  test('ShrinkRollback StockInfo renders numeric quantity 0 instead of blank', () => {
    render(
      <table>
        <tbody>
          <ShrinkRollbackStockInfo
            object={{
              nodes: [],
              stockInfo: {
                color: 1,
                defect: '',
                record: '',
                stockIdentifier: {
                  id: 12,
                  productNo: 'CF100',
                  lotNo: 'LOT-0',
                  type: '板卷',
                  quantity: 0,
                  unit: '碼',
                },
              },
            }}
            handleShrinkRollback={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('0碼')).toBeInTheDocument();
  });
});
