import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
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

  test('50 rows is the most that can be added at once', async () => {
    renderBoard();
    const before = editableQuantityInputs().length;

    await addRows('50');

    expect(editableQuantityInputs()).toHaveLength(before + 50);
    expect(screen.queryByText('一次最多新增 50 列')).not.toBeInTheDocument();
  });

  test.each(['51', '1e6'])('%j shows a hint and adds nothing', async (value) => {
    renderBoard();
    const before = editableQuantityInputs().length;

    await addRows(value);

    expect(editableQuantityInputs()).toHaveLength(before);
    const input = screen.getByPlaceholderText('輸入列數');
    expect(input).toHaveValue(value);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('一次最多新增 50 列');
    expect(screen.getByRole('button', { name: '新增' })).toBeDisabled();
  });

  test('the hint goes away once the value is back within the limit', async () => {
    renderBoard();
    const input = screen.getByPlaceholderText('輸入列數');

    fireEvent.change(input, { target: { value: '51' } });
    expect(screen.getByText('一次最多新增 50 列')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '5' } });
    expect(screen.queryByText('一次最多新增 50 列')).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('button', { name: '新增' })).toBeEnabled();
  });
});

// Rows added together with 新增複數列數 must be independent: marking one row for 直出 (direct
// ship) must not mark the others.
describe.each([
  ['入庫 Step 3 (StockInfoContainer)', renderInStock],
  ['減肥 (ModifyRequestBoard)', renderShrink],
])('%s rows added together', (_name, renderBoard) => {
  const shipIcons = (container: HTMLElement, checked: boolean) =>
    Array.from(
      container.querySelectorAll<SVGElement>(
        `[data-testid=${checked ? 'CheckBoxRoundedIcon' : 'CheckBoxOutlineBlankRoundedIcon'}]`
      )
    );

  test('marking one row for direct ship leaves the others unmarked', async () => {
    const { container } = renderBoard();
    const before = shipIcons(container, false).length;
    await addRows('3');
    const blanks = shipIcons(container, false);
    expect(blanks).toHaveLength(before + 3);

    // Mark the second of the new rows: open its ship modal, pick a reason, confirm.
    fireEvent.click(blanks[before + 1]);
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '中壢' }));
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: '確認' }));
    });

    expect(shipIcons(container, true)).toHaveLength(1);
    expect(shipIcons(container, false)).toHaveLength(before + 2);
  });
});
