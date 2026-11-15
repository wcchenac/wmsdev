import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import SearchContainer from '../../../../../components/BO/Stock/OutStockList/SearchContainer';
import { OutStockInfo } from '../../../../../components/BO/Stock/OutStockList/SearchInfo';

function row(id: number, productNo: string): OutStockInfo {
  return {
    id,
    productNo,
    type: '整支',
    quantity: 1,
    unit: '碼',
    reason: '中壢',
    createdBy: 'user1',
    handled: false,
    outStockType: 2,
    fileName: '',
  };
}

const handlers = {
  allSelectMethod: vi.fn(),
  handleToBeSubmitChange: vi.fn(),
  handleToBeSubmitWHChange: vi.fn(),
  handleDeleteClick: vi.fn(),
  downloadFile: vi.fn(),
  handleModalShow: vi.fn(),
  initialize: vi.fn(),
};

function renderRows(
  rows: OutStockInfo[],
  toBeSubmit: Record<number, { selected: boolean; whName: string }>
) {
  return render(
    <SearchContainer
      index={0}
      active
      date="2024-01-01"
      outStockListFiltered={rows}
      toBeSubmit={toBeSubmit}
      {...handlers}
    />
  );
}

describe('SearchContainer warehouse select', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('uses the row id and a controlled value, so a hidden row does not leave its warehouse behind', () => {
    const first = row(1, 'AAA');
    const second = row(2, 'BBB');
    const { rerender } = renderRows([first, second], {
      1: { selected: true, whName: '內倉' },
      2: { selected: true, whName: '外倉' },
    });

    expect(within(screen.getByRole('row', { name: /AAA/ })).getByRole('combobox')).toHaveValue('內倉');
    expect(within(screen.getByRole('row', { name: /BBB/ })).getByRole('combobox')).toHaveValue('外倉');

    const secondSelect = within(screen.getByRole('row', { name: /BBB/ })).getByRole('combobox');
    fireEvent.change(secondSelect, { target: { value: '業外' } });
    expect(handlers.handleToBeSubmitWHChange).toHaveBeenCalledWith('2024-01-01', '業外', 2);
    expect(secondSelect).toHaveValue('外倉');

    rerender(
      <SearchContainer
        index={0}
        active
        date="2024-01-01"
        outStockListFiltered={[second]}
        toBeSubmit={{
          1: { selected: true, whName: '內倉' },
          2: { selected: true, whName: '外倉' },
        }}
        {...handlers}
      />
    );

    const remaining = screen.getAllByRole('combobox');
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toHaveValue('外倉');
    expect(screen.queryByRole('row', { name: /AAA/ })).not.toBeInTheDocument();
  });
});
