import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import InStockRollbackModal from '../../../../../components/BO/User/AdminPlatform/InStockRollback/RollbackModal';
import ShrinkRollbackModal from '../../../../../components/BO/User/AdminPlatform/ShrinkRollback/RollbackModal';
import type { ShrinkRollbackObject, StockInfo } from '../../../../../types';

describe('RollbackModal isRollbackDisabled and submission (H-20)', () => {
  describe('InStockRollback RollbackModal', () => {
    const makeRow = (id: number, exist: boolean): StockInfo => ({
      defect: 'GA',
      record: '',
      remark: '',
      stockIdentifier: { id, productNo: 'CF1001', lotNo: `L${id}`, type: '板卷', quantity: 5, unit: '碼', exist },
    });

    test('enables confirm when all items exist and submits all ids', () => {
      const handleSubmitClick = vi.fn();
      render(
        <InStockRollbackModal
          show
          list={[makeRow(1, true), makeRow(2, true)]}
          handleModalClose={vi.fn()}
          handleSubmitClick={handleSubmitClick}
        />
      );

      const confirmBtn = screen.getByRole('button', { name: '確認' });
      expect(confirmBtn).toBeEnabled();
      fireEvent.click(confirmBtn);
      expect(handleSubmitClick).toHaveBeenCalledWith([1, 2]);
    });

    test('disables confirm and marks missing row when any item has exist=false', () => {
      render(
        <InStockRollbackModal
          show
          list={[makeRow(1, true), makeRow(2, false)]}
          handleModalClose={vi.fn()}
          handleSubmitClick={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: '確認' })).toBeDisabled();
      expect(screen.getByText('L2').closest('tr')).toHaveClass('table-secondary');
    });
  });

  describe('ShrinkRollback RollbackModal', () => {
    const makeObject = (childExist: boolean): ShrinkRollbackObject => ({
      stockInfo: { stockIdentifier: { id: 10, productNo: 'CF1001', lotNo: 'PARENT' } },
      nodes: [
        {
          stockInfo: {
            defect: '',
            record: '',
            remark: '',
            stockIdentifier: {
              id: 11,
              productNo: 'CF1001',
              lotNo: 'CHILD-1',
              type: '板卷',
              quantity: 3,
              unit: '碼',
              exist: childExist,
            },
          },
        },
      ],
    });

    test('enables confirm when all child nodes exist and calls handleSubmitClick', () => {
      const handleSubmitClick = vi.fn();
      render(
        <ShrinkRollbackModal
          show
          object={makeObject(true)}
          handleModalClose={vi.fn()}
          handleSubmitClick={handleSubmitClick}
        />
      );

      const confirmBtn = screen.getByRole('button', { name: '確認' });
      expect(confirmBtn).toBeEnabled();
      fireEvent.click(confirmBtn);
      expect(handleSubmitClick).toHaveBeenCalledTimes(1);
    });

    test('disables confirm and marks missing row when any child node has exist=false', () => {
      render(
        <ShrinkRollbackModal
          show
          object={makeObject(false)}
          handleModalClose={vi.fn()}
          handleSubmitClick={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: '確認' })).toBeDisabled();
      expect(screen.getByText('CHILD-1').closest('tr')).toHaveClass('table-secondary');
    });
  });
});
