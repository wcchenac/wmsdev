import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore } from '../../helpers/mockStore';
import FileContainer from '../../../components/BO/File/FileContainer';
import ShrinkInfoContainer from '../../../components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkInfoContainer';
import ShrinkRollbackContainer from '../../../components/BO/User/AdminPlatform/ShrinkRollback/StockInfoContainer';
import InStockRollback from '../../../components/BO/User/AdminPlatform/InStockRollback/InStockRollback';
import StockCategory from '../../../components/BO/User/AdminPlatform/StockCategory';
import type { ShrinkRollbackObject } from '../../../types';

vi.mock('../../../utilities/API', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: [] }), post: vi.fn(), patch: vi.fn() },
}));

describe('BO Accessibility and UI Adoption (H-16, H-18)', () => {
  test('FileContainer renders filenames as selectable text instead of disabled buttons and names action column', () => {
    const { container } = render(
      <FileContainer
        filenames={['daily-2026.xlsx']}
        containerTitle="每日調整"
        fileType="adjustment"
        handleFileCategoryCurrentQuery={vi.fn()}
        handleFileCategoryPeriodQuery={vi.fn()}
        downloadFile={vi.fn()}
      />
    );

    expect(container.querySelectorAll('button.btn-customize')).toHaveLength(0);
    expect(screen.getByText('daily-2026.xlsx').tagName).toBe('TD');
    expect(screen.getByRole('columnheader', { name: '操作' })).toBeInTheDocument();
  });

  test('ShrinkRollback StockInfoContainer renders plain text cells without disabled buttons', () => {
    const row: ShrinkRollbackObject = {
      stockInfo: {
        stockIdentifier: {
          id: 10,
          productNo: 'CF900',
          lotNo: 'L9',
          type: '整支',
          quantity: 12,
          unit: '碼',
          eliminateDate: '2026-11-18',
        },
      },
      nodes: [],
    };
    const { container } = render(
      <ShrinkRollbackContainer result={[row]} handleShrinkRollback={vi.fn()} />
    );

    expect(container.querySelectorAll('button.btn-customize')).toHaveLength(0);
    expect(screen.getByText('CF900').tagName).toBe('TD');
    expect(screen.getByRole('columnheader', { name: '操作' })).toBeInTheDocument();
  });

  test('ShrinkInfoContainer renders shared EmptyState when shrinkList is empty', () => {
    render(
      <ShrinkInfoContainer
        shrinkList={[]}
        onModifyClick={vi.fn()}
        onCancelShrinkClick={vi.fn()}
      />
    );

    expect(screen.getByRole('status', { name: '查無資料' })).toBeInTheDocument();
  });

  test('InStockRollback associates labels with orderType and orderNo inputs', () => {
    const store = createMockStore({
      stockInfo: { inStockRollbackList: {} },
    });
    render(
      <Provider store={store}>
        <InStockRollback />
      </Provider>
    );

    expect(screen.getByLabelText('進貨方式:')).toHaveAttribute('name', 'orderType');
    expect(screen.getByLabelText('單號:')).toHaveAttribute('name', 'orderNo');
  });

  test('StockCategory associates label with react-select input inside shared Card', () => {
    const store = createMockStore({
      stockInfo: { categories: [] },
    });
    const { container } = render(
      <Provider store={store}>
        <StockCategory />
      </Provider>
    );

    expect(screen.getByLabelText('請選擇想要輸出的分類...')).toBeInTheDocument();
    expect(container.querySelector('.card')).toBeInTheDocument();
  });
});
