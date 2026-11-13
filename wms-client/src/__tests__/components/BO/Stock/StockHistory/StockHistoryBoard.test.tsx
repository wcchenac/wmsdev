import React from 'react';
import { render, screen, fireEvent, waitFor, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import StockHistoryBoard from '../../../../../components/BO/Stock/StockHistory/StockHistoryBoard';

interface StockInfoState {
  stockInfo: {
    stockInfoes: unknown[];
  };
}

interface RenderWithReduxResult extends RenderResult {
  store: MockStoreEnhanced<unknown>;
}

interface StockHistoryRequest {
  productNo: string;
}


const mockStore = configureMockStore([thunk]);

// Mock actions
const mockGetProductHistory = jest.fn();
jest.mock('../../../../../actions/StockActions', () => ({
  getProductHistory: (request: StockHistoryRequest) => () => mockGetProductHistory(request)
}));

const renderWithRedux = (component: React.ReactElement, { initialState }: { initialState: StockInfoState }): RenderWithReduxResult => {
  const store = mockStore(initialState);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('StockHistoryBoard', () => {
  let initialState: StockInfoState;

  beforeEach(() => {
    initialState = {
      stockInfo: {
        stockInfoes: []
      }
    };
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    renderWithRedux(<StockHistoryBoard />, { initialState });

    expect(screen.getByText('設定時間區間')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('請輸入貨號進行搜尋...')).toBeInTheDocument();
  });

  test('handles product number input change', () => {
    renderWithRedux(<StockHistoryBoard />, { initialState });

    const input = screen.getByPlaceholderText('請輸入貨號進行搜尋...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'TEST-PROD-001', name: 'productNo' } });

    expect(input.value).toBe('TEST-PROD-001');
  });

  test('calls getProductHistory on submit', async () => {
    mockGetProductHistory.mockResolvedValue({ status: 200 });

    renderWithRedux(<StockHistoryBoard />, { initialState });

    const input = screen.getByPlaceholderText('請輸入貨號進行搜尋...');
    fireEvent.change(input, { target: { value: 'TEST-PROD-001', name: 'productNo' } });

    const submitBtn = screen.getByText('查詢');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockGetProductHistory).toHaveBeenCalledWith(expect.objectContaining({
        productNo: 'TEST-PROD-001'
      }));
    });
  });

  test('shows empty message when no results found after query', async () => {
    mockGetProductHistory.mockResolvedValue({ status: 200 });

    const { rerender } = renderWithRedux(<StockHistoryBoard />, { initialState });

    // Simulate query
    const input = screen.getByPlaceholderText('請輸入貨號進行搜尋...');
    fireEvent.change(input, { target: { value: 'EMPTY-PROD', name: 'productNo' } });
    fireEvent.click(screen.getByText('查詢'));

    // Update store with empty results
    const updatedState: StockInfoState = {
      stockInfo: {
        stockInfoes: []
      }
    };

    // In actual app, the component updates via componentDidUpdate when props change
    rerender(
      <Provider store={mockStore(updatedState)}>
        <StockHistoryBoard />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('查無此貨號資料 或 此貨號設定期間內無進貨資料')).toBeInTheDocument();
    });
  });

  test('renders tree nodes when data is available', async () => {
    mockGetProductHistory.mockResolvedValue({ status: 200 });

    // Data structure that matches what Redux provides
    const mockTreeData = {
      stockInfoes: [
        {
          stockInfo: {
            defect: 'none',
            color: 'blue',
            record: 'test record',
            stockIdentifier: {
              productNo: 'PROD-1',
              lotNo: 'LOT-1',
              type: 'test',
              quantity: 10,
              unit: 'pcs',
              firstInStockAt: '2024-01-01',
              inStockType: 'normal',
              exist: true
            }
          },
          nodes: []
        }
      ]
    };

    const { rerender } = renderWithRedux(<StockHistoryBoard />, {
        initialState: { stockInfo: { stockInfoes: [] } }
    });

    // Simulate query success to set isQuery = true
    fireEvent.change(screen.getByPlaceholderText('請輸入貨號進行搜尋...'), { target: { value: 'PROD-1', name: 'productNo' } });
    fireEvent.click(screen.getByText('查詢'));

    // Update props with data
    rerender(
      <Provider store={mockStore({ stockInfo: mockTreeData })}>
        <StockHistoryBoard />
      </Provider>
    );

    await waitFor(() => {
      // Component now uses TreeDataNode which renders stock info
      // When data is available and isQuery is true, it should render tree nodes
      // Check that the empty message is NOT shown
      expect(screen.queryByText('查無此貨號資料 或 此貨號設定期間內無進貨資料')).not.toBeInTheDocument();
    });
  });
});
