import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import StockInfoContainer from '../../../../components/BO/Stock/InStock/Common/StockInfoContainer';
import ModifyRequestBoard from '../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ModifyRequestBoard';
import { StockIdentifierType } from '../../../../enums/Enums';
import type { StockInfo } from '../../../../types';

// 新增複數列數 on 入庫 Step 3 and on 減肥 must read the typed value the same way.

const renderInStock = () =>
  render(
    <StockInfoContainer
      sequence={0}
      index={0}
      productNo="CF1001"
      typeValidation={false}
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

const editableQuantityInputs = () =>
  (screen.queryAllByPlaceholderText('數量') as HTMLInputElement[]).filter((input) => !input.disabled);

const addRows = async (value: string) => {
  const input = screen.getByPlaceholderText('輸入列數');
  fireEvent.change(input, { target: { value } });
  await act(async () => {
    fireEvent.submit(input.closest('form')!);
  });
};

describe.each([
  ['入庫 Step 3 (StockInfoContainer)', renderInStock],
  ['減肥 (ModifyRequestBoard)', renderShrink],
])('%s 新增複數列數', (_name, renderBoard) => {
  test.each([
    ['3', 3],
    ['2.7', 2],
    ['', 0],
    ['abc', 0],
    ['-2', 0],
  ])('%j adds %i rows', async (value, added) => {
    renderBoard();
    const before = editableQuantityInputs().length;

    await addRows(value);

    expect(editableQuantityInputs()).toHaveLength(before + added);
    expect(screen.getByPlaceholderText('輸入列數')).toHaveValue('0');
  });
});
