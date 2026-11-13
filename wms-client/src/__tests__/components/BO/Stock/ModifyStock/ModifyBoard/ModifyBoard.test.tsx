import React from 'react';
import { render, screen, fireEvent, waitFor, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import ModifyBoard from '../../../../../../components/BO/Stock/ModifyStock/ModifyBoard/ModifyBoard';

interface ProductList {
  type: string;
  quantity: number;
  unit: string;
}

interface StockIdentifier {
  id?: number;
  productNo: string;
  lotNo?: string;
  type: string;
}

interface StockInfo {
  defect: string;
}

interface StockInfoResult {
  stockIdentifier: StockIdentifier;
  stockInfo: StockInfo;
}

interface StockInfoes {
  information: {
    productNo: string | null;
    name?: string;
    category?: string;
  };
  prevProduct: string | null;
  nextProduct: string | null;
  result: StockInfoResult[];
  productList: ProductList[] | Record<string, unknown>;
}

interface StoreState {
  stockInfo: {
    stockInfoes: StockInfoes;
  };
}

interface RenderWithReduxResult extends RenderResult {
  store: MockStoreEnhanced<unknown>;
}

const mockStore = configureMockStore([thunk]);

// Mock actions
const mockGetStockInfoes = jest.fn();
const mockStockIdentifierIsShiped = jest.fn();
const mockStockIdentifiersAreShiped = jest.fn();
const mockStockIdentifierWaitToShrinkIsTrue = jest.fn();
const mockCreateOutStockRequest = jest.fn();
const mockUpdateStockInfo = jest.fn();

jest.mock('../../../../../../actions/StockActions', () => ({
  getStockInfoes: (id: string) => () => mockGetStockInfoes(id),
  stockIdentifierIsShiped: (req: unknown) => () => mockStockIdentifierIsShiped(req),
  stockIdentifiersAreShiped: (no: string, reqs: unknown[]) => () => mockStockIdentifiersAreShiped(no, reqs),
  stockIdentifierWaitToShrinkIsTrue: (id: string) => () => mockStockIdentifierWaitToShrinkIsTrue(id),
  createOutStockRequest: (req: unknown) => () => mockCreateOutStockRequest(req),
  updateStockInfo: (req: unknown) => () => mockUpdateStockInfo(req)
}));

const renderWithRedux = (component: React.ReactElement, { initialState }: { initialState: StoreState }): RenderWithReduxResult => {
  const store = mockStore(initialState);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('ModifyBoard', () => {
  let initialState: StoreState;

  beforeEach(() => {
    initialState = {
      stockInfo: {
        stockInfoes: {
          information: { productNo: null },
          prevProduct: null,
          nextProduct: null,
          result: [],
          productList: {}
        }
      }
    };
    jest.clearAllMocks();
  });

  test('renders search input', () => {
    renderWithRedux(<ModifyBoard />, { initialState });
    expect(screen.getByPlaceholderText('請輸入貨號進行搜尋...')).toBeInTheDocument();
  });

  test('calls getStockInfoes on submit', async () => {
    mockGetStockInfoes.mockResolvedValue({ status: 200 });
    renderWithRedux(<ModifyBoard />, { initialState });

    const input = screen.getByPlaceholderText('請輸入貨號進行搜尋...');
    fireEvent.change(input, { target: { value: 'PROD-001', name: 'productNo' } });
    fireEvent.click(screen.getByText('查詢'));

    await waitFor(() => {
      expect(mockGetStockInfoes).toHaveBeenCalledWith('PROD-001');
    });
  });

  test('shows product information when query is successful', async () => {
    const successState: StoreState = {
      stockInfo: {
        stockInfoes: {
          information: {
            productNo: 'PROD-001',
            name: 'Test Product',
            category: 'Category A'
          },
          prevProduct: 'PREV',
          nextProduct: 'NEXT',
          result: [
            {
              stockIdentifier: {
                id: 1,
                productNo: 'PROD-001',
                lotNo: 'LOT1',
                type: 'hardware'
              },
              stockInfo: { defect: 'none' }
            }
          ],
          productList: [
            { type: 'normal', quantity: 10, unit: 'pcs' }
          ]
        }
      }
    };

    const { rerender } = renderWithRedux(<ModifyBoard />, { initialState });

    // Simulate successful query action
    mockGetStockInfoes.mockResolvedValue({ status: 200 });

    const input = screen.getByPlaceholderText('請輸入貨號進行搜尋...');
    fireEvent.change(input, { target: { value: 'PROD-001', name: 'productNo' } });
    fireEvent.click(screen.getByText('查詢'));

    // Rerender with success state to trigger componentDidUpdate
    rerender(
      <Provider store={mockStore(successState)}>
        <ModifyBoard />
      </Provider>
    );

    await waitFor(() => {
      // PROD-001 appears in multiple places (label, button, input)
      expect(screen.getAllByText('PROD-001').length).toBeGreaterThan(0);
    });
  });

  test('opens OutStockModal when clicking 拉貨要求 button', async () => {
    const successState: StoreState = {
      stockInfo: {
        stockInfoes: {
          information: { productNo: 'PROD-001' },
          prevProduct: null,
          nextProduct: null,
          result: [
            {
              stockIdentifier: {
                productNo: 'PROD-001',
                type: 'not-hardware' // To enable the button
              },
              stockInfo: { defect: 'none' }
            }
          ],
          productList: [
            { type: 'normal', quantity: 10, unit: 'pcs' }
          ]
        }
      }
    };

    const { rerender } = renderWithRedux(<ModifyBoard />, { initialState });

    mockGetStockInfoes.mockResolvedValue({ status: 200 });

    const input = screen.getByPlaceholderText('請輸入貨號進行搜尋...');
    fireEvent.change(input, { target: { value: 'PROD-001', name: 'productNo' } });
    fireEvent.click(screen.getByText('查詢'));

    // Rerender with success state to trigger componentDidUpdate
    rerender(
      <Provider store={mockStore(successState)}>
        <ModifyBoard />
      </Provider>
    );

    // After state update from successState, the button should be enabled
    await waitFor(() => {
      // There might be multiple '拉貨要求' (button and modal title)
      const outStockBtns = screen.getAllByText('拉貨要求');
      const btn = outStockBtns.find(el => el.tagName === 'BUTTON');
      expect(btn).not.toBeDisabled();
      fireEvent.click(btn as HTMLElement);
    });

    // Check if modal title appears (it's also '拉貨要求')
    await waitFor(() => {
      const titles = screen.getAllByText('拉貨要求');
      // Look for the one in the modal header
      expect(titles.some(el => el.classList.contains('modal-title'))).toBe(true);
    });
  });
});
