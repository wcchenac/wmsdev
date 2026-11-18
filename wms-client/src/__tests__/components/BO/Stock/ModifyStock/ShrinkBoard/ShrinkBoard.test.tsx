import React from 'react';
import { act, render, screen, fireEvent, waitFor, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore, TestMockStore } from '../../../../../helpers/mockStore';
import ShrinkBoard from '../../../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkBoard';

interface StoreState {
  stockInfo: {
    shrinkList: unknown[];
  };
}

interface RenderWithReduxResult extends RenderResult {
  store: TestMockStore;
}

type ModifyType = 'typeExchange' | 'sameTypeModify' | 'hardwareModify';

interface MockShrinkListProps {
  queryShrinkList: () => void;
  onCancelShrinkClick: (stockIdentifierId: number) => void;
  onModifyClick: (type: ModifyType, info: { stockIdentifier: { id: number } }) => void;
}

interface MockModifyRequestBoardProps {
  isLoading?: boolean;
  handleGoBack: () => void;
  handleModifyRequestSubmit: (data: Record<string, unknown>) => void;
}

const mockStore = createMockStore;

// Mock actions
const mockGetShrinkList = vi.fn();
const mockStockIdentifierWaitToShrinkIsFalse = vi.fn();
const mockBatchCreateStockInfoesForShrink = vi.fn();

vi.mock('../../../../../../actions/StockActions', () => ({
  getShrinkList: () => () => mockGetShrinkList(),
  stockIdentifierWaitToShrinkIsFalse: (id: number) => () => mockStockIdentifierWaitToShrinkIsFalse(id),
  batchCreateStockInfoesForShrink: (req: unknown) => () => mockBatchCreateStockInfoesForShrink(req)
}));

// Mock child components to isolate ShrinkBoard logic
vi.mock('../../../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkList', () => ({ default: (() => {
  return function MockShrinkList({ queryShrinkList, onCancelShrinkClick, onModifyClick }: MockShrinkListProps): React.JSX.Element {
    return (
      <div data-testid="shrink-list">
        <button onClick={queryShrinkList}>Refresh List</button>
        <button onClick={() => onCancelShrinkClick(123)}>Cancel Shrink</button>
        <button onClick={() => onModifyClick('sameTypeModify', { stockIdentifier: { id: 1 } })}>Modify Same Type</button>
      </div>
    );
  };
})() }));

vi.mock('../../../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ModifyRequestBoard', () => ({ default: (() => {
  return function MockModifyRequestBoard({ isLoading, handleGoBack, handleModifyRequestSubmit }: MockModifyRequestBoardProps): React.JSX.Element {
    return (
      <div data-testid="modify-request-board">
        <button onClick={handleGoBack} disabled={isLoading}>Go Back</button>
        <button onClick={() => handleModifyRequestSubmit({})} disabled={isLoading}>Submit Request</button>
      </div>
    );
  };
})() }));

const renderWithRedux = (component: React.ReactElement, { initialState }: { initialState: StoreState }): RenderWithReduxResult => {
  const store = mockStore(initialState);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('ShrinkBoard', () => {
  let initialState: StoreState;

  beforeEach(() => {
    initialState = {
      stockInfo: {
        shrinkList: []
      }
    };
    vi.clearAllMocks();
  });

  test('renders ShrinkList by default', () => {
    renderWithRedux(<ShrinkBoard />, { initialState });
    expect(screen.getByTestId('shrink-list')).toBeInTheDocument();
  });

  test('calls getShrinkList when ShrinkList requests refresh', async () => {
    mockGetShrinkList.mockResolvedValue({ status: 200 });
    renderWithRedux(<ShrinkBoard />, { initialState });

    fireEvent.click(screen.getByText('Refresh List'));

    await waitFor(() => {
      expect(mockGetShrinkList).toHaveBeenCalled();
    });
  });

  test('calls stockIdentifierWaitToShrinkIsFalse when cancel button is clicked', async () => {
    mockStockIdentifierWaitToShrinkIsFalse.mockResolvedValue({ status: 200 });
    renderWithRedux(<ShrinkBoard />, { initialState });

    fireEvent.click(screen.getByText('Cancel Shrink'));

    await waitFor(() => {
      expect(mockStockIdentifierWaitToShrinkIsFalse).toHaveBeenCalledWith(123);
    });
  });

  test('switches to ModifyRequestBoard when onModifyClick is called', () => {
    renderWithRedux(<ShrinkBoard />, { initialState });

    // Initial state check
    expect(screen.getByTestId('shrink-list')).toBeInTheDocument();
    expect(screen.queryByTestId('modify-request-board')).not.toBeInTheDocument();

    // Trigger modify click
    fireEvent.click(screen.getByText('Modify Same Type'));

    // Should render ModifyRequestBoard
    expect(screen.getByTestId('modify-request-board')).toBeInTheDocument();
    expect(screen.queryByTestId('shrink-list')).not.toBeInTheDocument();
  });

  test('switches back to ShrinkList when handleGoBack is called', () => {
    renderWithRedux(<ShrinkBoard />, { initialState });

    // Go to ModifyRequestBoard first
    fireEvent.click(screen.getByText('Modify Same Type'));
    expect(screen.getByTestId('modify-request-board')).toBeInTheDocument();

    // Go back
    fireEvent.click(screen.getByText('Go Back'));

    // Should render ShrinkList again
    expect(screen.getByTestId('shrink-list')).toBeInTheDocument();
  });

  test('calls batchCreateStockInfoesForShrink when submitting request', async () => {
    mockBatchCreateStockInfoesForShrink.mockResolvedValue({ status: 200 });
    renderWithRedux(<ShrinkBoard />, { initialState });

    // Go to ModifyRequestBoard
    fireEvent.click(screen.getByText('Modify Same Type'));

    // Submit request
    fireEvent.click(screen.getByText('Submit Request'));

    await waitFor(() => {
      expect(mockBatchCreateStockInfoesForShrink).toHaveBeenCalled();
    });
  });

  test('locks ModifyRequestBoard while shrink submission is in flight', async () => {
    let resolveSubmit!: (value: { status: number }) => void;
    mockBatchCreateStockInfoesForShrink.mockImplementation(
      () => new Promise((resolve) => {
        resolveSubmit = resolve;
      })
    );
    renderWithRedux(<ShrinkBoard />, { initialState });

    fireEvent.click(screen.getByText('Modify Same Type'));
    const submitBtn = screen.getByRole('button', { name: 'Submit Request' });
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(mockBatchCreateStockInfoesForShrink).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSubmit({ status: 200 });
    });
  });
});
