import React from 'react';
import { act, render, screen } from '@testing-library/react';
import EditBoard from '../../../../../components/BO/Stock/InStock/Common/EditBoard';

// When every ticked product has been submitted, Step 3 says 「此次入庫作業已完成」 and goes back
// to Step 1 after 3 seconds — once, however often the board re-renders meanwhile, and not at
// all if the board is gone before then.

const completed = [
  { productNo: 'P1', selected: true, index: 0, isSubmitted: true },
  { productNo: 'P2', selected: false, index: 1, isSubmitted: false },
];

const renderBoard = (getInitialize: () => void, isLoading = false) => (
  <EditBoard
    isLoading={isLoading}
    selectedProductNoList={completed}
    orderNo="X1"
    type="normal"
    waitHandleStatus={{}}
    getInitialize={getInitialize}
    handleInStockRequestSubmit={vi.fn()}
    handlePrevStep={vi.fn()}
  />
);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('EditBoard completion', () => {
  test('returns to Step 1 once after 3 seconds, even if it re-renders meanwhile', () => {
    const getInitialize = vi.fn();
    const { rerender } = render(renderBoard(getInitialize));
    expect(screen.getByText('此次入庫作業已完成')).toBeInTheDocument();

    // Re-render with changed props while the message is shown (memo skips equal props).
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    rerender(renderBoard(getInitialize, true));
    rerender(renderBoard(getInitialize, false));

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(getInitialize).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(getInitialize).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(getInitialize).toHaveBeenCalledTimes(1);
  });

  test('does not go back if the board is gone before 3 seconds', () => {
    const getInitialize = vi.fn();
    const { rerender, unmount } = render(renderBoard(getInitialize));
    rerender(renderBoard(getInitialize, true));

    unmount();
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(getInitialize).not.toHaveBeenCalled();
  });
});
