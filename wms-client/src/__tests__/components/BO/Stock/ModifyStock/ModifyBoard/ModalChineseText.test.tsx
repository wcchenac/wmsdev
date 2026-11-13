import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import OutStockModal from '../../../../../../components/BO/Stock/ModifyStock/ModifyBoard/OutStockModal';
import InformationModal from '../../../../../../components/BO/Stock/ModifyStock/ModifyBoard/InformationModal';
import { StockIdentifierType } from '../../../../../../enums/Enums';
import type { StockInfo } from '../../../../../../types';

// JSX attribute strings do not process \u escapes: value="碼" is the six characters
// 碼, not 碼. These modals must hold real Chinese text in their option values,
// placeholders and aria-labels.

const ESCAPE = /\\u[0-9a-fA-F]{4}/;

const attributesOf = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('*')).flatMap((el) =>
    ['value', 'placeholder', 'aria-label']
      .map((name) => el.getAttribute(name))
      .filter((v): v is string => v !== null)
  );

describe('拉貨要求 (OutStockModal)', () => {
  const renderModal = () => {
    const handleOutStockRequestCreate = vi.fn();
    render(
      <OutStockModal
        productNo="CF1001"
        show
        handleModalClose={vi.fn()}
        handleOutStockRequestCreate={handleOutStockRequestCreate}
      />
    );
    return { dialog: screen.getByRole('dialog'), handleOutStockRequestCreate };
  };

  test('the unit options are 碼 and 尺', () => {
    const { dialog } = renderModal();
    const options = Array.from(dialog.querySelectorAll<HTMLOptionElement>('select[name=unit] option'));
    expect(options.map((o) => [o.value, o.textContent])).toEqual([
      ['碼', '碼'],
      ['尺', '尺'],
    ]);
  });

  test('choosing a unit sends that unit, e.g. 碼', async () => {
    const { dialog, handleOutStockRequestCreate } = renderModal();
    const unit = dialog.querySelector<HTMLSelectElement>('select[name=unit]')!;

    // Switch to 尺 and back to 碼 through the select, as a user would.
    fireEvent.change(unit, { target: { value: unit.options[1].value, name: 'unit' } });
    fireEvent.change(unit, { target: { value: unit.options[0].value, name: 'unit' } });
    fireEvent.change(dialog.querySelector('input[name=outStockReason]')!, {
      target: { value: '中壢', name: 'outStockReason' },
    });
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: '儲存至明細' }));
    });

    expect(handleOutStockRequestCreate).toHaveBeenCalledWith(expect.objectContaining({ unit: '碼', reason: '中壢' }));
  });

  test('placeholders and aria-labels are readable Chinese', () => {
    const { dialog } = renderModal();
    // The quantity range fields only exist in range mode.
    fireEvent.click(dialog.querySelector('input[name=assignMode]')!);

    expect(screen.getByPlaceholderText('最小數量')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('最大數量')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('請輸入出庫原因')).toBeInTheDocument();
    expect(screen.getByLabelText('選擇單位')).toBeInTheDocument();
    expect(screen.getByLabelText('選擇庫存型態')).toBeInTheDocument();
    expect(attributesOf(dialog).filter((v) => ESCAPE.test(v))).toEqual([]);
  });
});

describe('詳細資料 (InformationModal)', () => {
  test('the edit form placeholders are readable Chinese', () => {
    const stockInfo = {
      id: 8,
      color: '2',
      defect: 'GA',
      record: '',
      remark: '',
      stockIdentifier: { id: 7, productNo: 'CF1001', lotNo: 'L1', type: StockIdentifierType.roll, quantity: 10, unit: '碼' },
    } as StockInfo;
    render(
      <InformationModal
        show
        onHide={vi.fn()}
        index={0}
        typeValidation={false}
        stockInfo={stockInfo}
        handleStockInfoUpdate={vi.fn()}
      />
    );
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '編輯' }));

    expect(screen.getByPlaceholderText('註解')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('記錄')).toBeInTheDocument();
    expect(attributesOf(dialog).filter((v) => ESCAPE.test(v))).toEqual([]);
  });
});
