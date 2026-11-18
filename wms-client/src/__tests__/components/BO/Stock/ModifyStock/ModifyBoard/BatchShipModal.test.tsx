import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import BatchShipModal from '../../../../../../components/BO/Stock/ModifyStock/ModifyBoard/BatchShipModal';

describe('BatchShipModal', () => {
  const rows = [
    { id: 1, productNo: 'CF1001', lotNo: 'L1', type: '整支', quantity: 10, unit: '碼' },
  ];

  test('disables save and cancel buttons while isLoading is true', () => {
    const handleModalClose = vi.fn();
    const handleShipList = vi.fn();

    render(
      <BatchShipModal
        show
        isLoading
        handleModalClose={handleModalClose}
        handleShipList={handleShipList}
        data={rows}
      />
    );

    const dialog = screen.getByRole('dialog');
    const cancelBtn = within(dialog).getByRole('button', { name: '取消' });
    const saveBtn = within(dialog).getByRole('button', { name: '處理中...' });

    expect(cancelBtn).toBeDisabled();
    expect(saveBtn).toBeDisabled();

    fireEvent.click(cancelBtn);
    fireEvent.click(saveBtn);
    expect(handleModalClose).not.toHaveBeenCalled();
    expect(handleShipList).not.toHaveBeenCalled();
  });

  test('enables cancel and save when not loading, a reason is chosen, and a row is selected', () => {
    const handleShipList = vi.fn();

    render(
      <BatchShipModal
        show
        isLoading={false}
        handleModalClose={vi.fn()}
        handleShipList={handleShipList}
        data={rows}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('button', { name: '取消' })).toBeEnabled();
    const saveBtn = within(dialog).getByRole('button', { name: '儲存選取項目' });
    expect(saveBtn).toBeDisabled();

    fireEvent.click(within(dialog).getByRole('button', { name: '中壢' }));
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /Select row/i }));

    expect(saveBtn).toBeEnabled();
    fireEvent.click(saveBtn);
    expect(handleShipList).toHaveBeenCalledWith([{ stockIdentifierId: 1, reason: '中壢' }]);
  });
});
