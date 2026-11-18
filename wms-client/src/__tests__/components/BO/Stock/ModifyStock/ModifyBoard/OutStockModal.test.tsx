import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import OutStockModal from '../../../../../../components/BO/Stock/ModifyStock/ModifyBoard/OutStockModal';

describe('OutStockModal submission & range validation', () => {
  test('keeps submit disabled while the request promise is pending and re-enables after it settles', async () => {
    let resolveSubmit!: () => void;
    const handleOutStockRequestCreate = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(
      <OutStockModal
        productNo="CF1001"
        show
        handleModalClose={vi.fn()}
        handleOutStockRequestCreate={handleOutStockRequestCreate}
      />
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.change(dialog.querySelector('input[name=outStockReason]')!, {
      target: { value: '中壢', name: 'outStockReason' },
    });

    const submitBtn = within(dialog).getByRole('button', { name: '儲存至明細' });
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);
    expect(handleOutStockRequestCreate).toHaveBeenCalledTimes(1);

    const busyBtn = within(dialog).getByRole('button', { name: '處理中...' });
    expect(busyBtn).toBeDisabled();

    // Pressing Enter or clicking again while submitting must not trigger a second call.
    fireEvent.click(busyBtn);
    fireEvent.keyDown(dialog.querySelector('form')!, { key: 'Enter', code: 'Enter' });
    expect(handleOutStockRequestCreate).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSubmit();
    });

    expect(within(dialog).getByRole('button', { name: '儲存至明細' })).toBeEnabled();
  });

  test('disables submit when quantity1 > quantity2 and enables when quantity1 <= quantity2', () => {
    render(
      <OutStockModal
        productNo="CF1001"
        show
        handleModalClose={vi.fn()}
        handleOutStockRequestCreate={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog.querySelector('input[name=assignMode]')!);
    fireEvent.change(dialog.querySelector('input[name=outStockReason]')!, {
      target: { value: '中壢', name: 'outStockReason' },
    });
    fireEvent.change(screen.getByPlaceholderText('最小數量'), {
      target: { value: '10', name: 'quantity1' },
    });
    fireEvent.change(screen.getByPlaceholderText('最大數量'), {
      target: { value: '5', name: 'quantity2' },
    });

    expect(within(dialog).getByRole('button', { name: '儲存至明細' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('最大數量須大於或等於最小數量');

    fireEvent.change(screen.getByPlaceholderText('最大數量'), {
      target: { value: '10', name: 'quantity2' },
    });
    expect(within(dialog).getByRole('button', { name: '儲存至明細' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('clears DOM input values when productNo changes because fields are controlled', () => {
    const { rerender } = render(
      <OutStockModal
        productNo="CF1001"
        show
        handleModalClose={vi.fn()}
        handleOutStockRequestCreate={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog.querySelector('input[name=assignMode]')!);
    fireEvent.change(dialog.querySelector('select[name=unit]')!, {
      target: { value: '尺', name: 'unit' },
    });
    fireEvent.change(dialog.querySelector('input[name=outStockReason]')!, {
      target: { value: '中壢', name: 'outStockReason' },
    });
    fireEvent.change(screen.getByPlaceholderText('最小數量'), {
      target: { value: '10', name: 'quantity1' },
    });
    fireEvent.change(screen.getByPlaceholderText('最大數量'), {
      target: { value: '20', name: 'quantity2' },
    });

    rerender(
      <OutStockModal
        productNo="CF1002"
        show
        handleModalClose={vi.fn()}
        handleOutStockRequestCreate={vi.fn()}
      />
    );

    expect(dialog.querySelector<HTMLSelectElement>('select[name=unit]')!.value).toBe('碼');
    expect(dialog.querySelector<HTMLInputElement>('input[name=outStockReason]')!.value).toBe('');
    fireEvent.click(dialog.querySelector('input[name=assignMode]')!);
    expect(screen.getByPlaceholderText<HTMLInputElement>('最小數量').value).toBe('');
    expect(screen.getByPlaceholderText<HTMLInputElement>('最大數量').value).toBe('');
  });
});
