import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import ModifyRequestBoard from '../../../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ModifyRequestBoard';
import { StockIdentifierType } from '../../../../../../enums/Enums';
import type { StockInfo } from '../../../../../../types';

describe('ModifyRequestBoard confirm and submit flow (H-20)', () => {
  test('submits validated shrink request through ShrinkConfirmModal', () => {
    const handleModifyRequestSubmit = vi.fn();
    const stockInfo: StockInfo = {
      color: 2,
      defect: 'GA',
      record: 'R1',
      stockIdentifier: {
        id: 77,
        productNo: 'CF500',
        lotNo: 'LOT-77',
        type: StockIdentifierType.roll,
        quantity: 20,
        unit: '碼',
      },
    };

    const { container } = render(
      <ModifyRequestBoard
        stockInfo={stockInfo}
        typeExchange={false}
        sameTypeModify={true}
        hardwareModify={false}
        handleGoBack={vi.fn()}
        handleModifyRequestSubmit={handleModifyRequestSubmit}
      />
    );

    const submitToolbarBtn = screen.getByRole('button', { name: '送出' });
    expect(submitToolbarBtn).toBeDisabled();

    const qtyInputs = container.querySelectorAll<HTMLInputElement>('input[name="quantity"]:not([disabled])');
    expect(qtyInputs).toHaveLength(2);
    fireEvent.change(qtyInputs[0], { target: { name: 'quantity', value: '12' } });
    fireEvent.change(qtyInputs[1], { target: { name: 'quantity', value: '8' } });

    expect(submitToolbarBtn).toBeEnabled();
    fireEvent.click(submitToolbarBtn);

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '送出' }));

    expect(handleModifyRequestSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        oldStockIdentifierId: 77,
        shrinkType: 'RR',
        allocation: 0,
        adjustment: 0,
        inStockRequests: [
          expect.objectContaining({
            productNo: 'CF500',
            quantity: '12',
            defect: 'GA',
            parentId: 77,
          }),
          expect.objectContaining({
            productNo: 'CF500',
            quantity: '8',
            defect: 'GA',
            parentId: 77,
          }),
        ],
      })
    );
  });

  test('renders small discrepancy confirmation when |adjustment| <= 3% of total', () => {
    const handleModifyRequestSubmit = vi.fn();
    const stockInfo: StockInfo = {
      color: 2,
      defect: 'GA',
      record: 'R1',
      stockIdentifier: {
        id: 78,
        productNo: 'CF501',
        lotNo: 'LOT-78',
        type: StockIdentifierType.roll,
        quantity: 20,
        unit: '碼',
      },
    };

    const { container } = render(
      <ModifyRequestBoard
        stockInfo={stockInfo}
        typeExchange={false}
        sameTypeModify={true}
        hardwareModify={false}
        handleGoBack={vi.fn()}
        handleModifyRequestSubmit={handleModifyRequestSubmit}
      />
    );

    const qtyInputs = container.querySelectorAll<HTMLInputElement>('input[name="quantity"]:not([disabled])');
    fireEvent.change(qtyInputs[0], { target: { name: 'quantity', value: '10' } });
    fireEvent.change(qtyInputs[1], { target: { name: 'quantity', value: '9.8' } });
    fireEvent.click(screen.getByRole('button', { name: '送出' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/減肥前後總數量不符/)).toBeInTheDocument();
    expect(within(dialog).getByText('-0.2')).toBeInTheDocument();
    expect(within(dialog).queryByText(/大於平常值/)).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: '送出' }));
    expect(handleModifyRequestSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ oldStockIdentifierId: 78, adjustment: -0.2 })
    );
  });

  test('renders >3% threshold warning when |adjustment| exceeds 3% of total', () => {
    const handleModifyRequestSubmit = vi.fn();
    const stockInfo: StockInfo = {
      color: 2,
      defect: 'GA',
      record: 'R1',
      stockIdentifier: {
        id: 79,
        productNo: 'CF502',
        lotNo: 'LOT-79',
        type: StockIdentifierType.roll,
        quantity: 20,
        unit: '碼',
      },
    };

    const { container } = render(
      <ModifyRequestBoard
        stockInfo={stockInfo}
        typeExchange={false}
        sameTypeModify={true}
        hardwareModify={false}
        handleGoBack={vi.fn()}
        handleModifyRequestSubmit={handleModifyRequestSubmit}
      />
    );

    const qtyInputs = container.querySelectorAll<HTMLInputElement>('input[name="quantity"]:not([disabled])');
    fireEvent.change(qtyInputs[0], { target: { name: 'quantity', value: '10' } });
    fireEvent.change(qtyInputs[1], { target: { name: 'quantity', value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: '送出' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('-5')).toBeInTheDocument();
    expect(within(dialog).getByText(/大於平常值/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: '送出' }));
    expect(handleModifyRequestSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ oldStockIdentifierId: 79, adjustment: -5 })
    );
  });

  test('displays the stock unit instead of hardcoded 碼 in ShrinkConfirmModal', () => {
    const stockInfo: StockInfo = {
      color: 2,
      defect: 'GA',
      record: 'R1',
      stockIdentifier: {
        id: 80,
        productNo: 'CF503',
        lotNo: 'LOT-80',
        type: StockIdentifierType.roll,
        quantity: 20,
        unit: '支',
      },
    };

    const { container } = render(
      <ModifyRequestBoard
        stockInfo={stockInfo}
        typeExchange={false}
        sameTypeModify={true}
        hardwareModify={false}
        handleGoBack={vi.fn()}
        handleModifyRequestSubmit={vi.fn()}
      />
    );

    const qtyInputs = container.querySelectorAll<HTMLInputElement>('input[name="quantity"]:not([disabled])');
    fireEvent.change(qtyInputs[0], { target: { name: 'quantity', value: '10' } });
    fireEvent.change(qtyInputs[1], { target: { name: 'quantity', value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: '送出' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/支，大於平常值/)).toBeInTheDocument();
  });
});
