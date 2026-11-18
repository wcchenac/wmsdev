import React from 'react';
import { act, render, screen, fireEvent, waitFor, within, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore, TestMockStore } from '../../../../../helpers/mockStore';
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
  store: TestMockStore;
}

const mockStore = createMockStore;

// Mock actions
const mockGetStockInfoes = vi.fn();
const mockStockIdentifierIsShiped = vi.fn();
const mockStockIdentifiersAreShiped = vi.fn();
const mockStockIdentifierWaitToShrinkIsTrue = vi.fn();
const mockCreateOutStockRequest = vi.fn();
const mockUpdateStockInfo = vi.fn();

vi.mock('../../../../../../actions/StockActions', () => ({
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
    vi.clearAllMocks();
    // clearAllMocks keeps implementations; drop the never-settling one a test may set.
    mockCreateOutStockRequest.mockReset();
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

  // ModifyBoard must hand the dispatch promise back to OutStockModal: the modal keeps its
  // submit locked until that promise settles. Without the `return`, the modal unlocks at
  // once and a second click sends a second 拉貨要求.
  test('keeps the 拉貨要求 modal locked until createOutStockRequest settles', async () => {
    const successState: StoreState = {
      stockInfo: {
        stockInfoes: {
          information: { productNo: 'PROD-001' },
          prevProduct: null,
          nextProduct: null,
          result: [{ stockIdentifier: { productNo: 'PROD-001', type: 'not-hardware' }, stockInfo: { defect: 'none' } }],
          productList: [{ type: 'normal', quantity: 10, unit: 'pcs' }],
        },
      },
    };
    let resolveCreate!: (value: { status: number }) => void;
    mockCreateOutStockRequest.mockImplementation(
      () => new Promise((resolve) => { resolveCreate = resolve; })
    );
    mockGetStockInfoes.mockResolvedValue({ status: 200 });

    const { rerender } = renderWithRedux(<ModifyBoard />, { initialState });
    fireEvent.change(screen.getByPlaceholderText('請輸入貨號進行搜尋...'), {
      target: { value: 'PROD-001', name: 'productNo' },
    });
    fireEvent.click(screen.getByText('查詢'));
    rerender(
      <Provider store={mockStore(successState)}>
        <ModifyBoard />
      </Provider>
    );
    await waitFor(() =>
      expect(screen.getAllByText('拉貨要求').find((el) => el.tagName === 'BUTTON')).toBeEnabled()
    );
    fireEvent.click(screen.getAllByText('拉貨要求').find((el) => el.tagName === 'BUTTON')!);

    const dialog = await screen.findByRole('dialog');
    fireEvent.change(dialog.querySelector('input[name=outStockReason]')!, {
      target: { value: '中壢', name: 'outStockReason' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: '儲存至明細' }));
    // Let every already-settled promise run, as it would before the user's next click.
    await act(async () => {});

    expect(mockCreateOutStockRequest).toHaveBeenCalledTimes(1);
    const busyBtn = within(dialog).getByRole('button', { name: '處理中...' });
    expect(busyBtn).toBeDisabled();
    fireEvent.click(busyBtn);
    fireEvent.keyDown(dialog.querySelector('form')!, { key: 'Enter', code: 'Enter' });
    expect(mockCreateOutStockRequest).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveCreate({ status: 200 });
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mockCreateOutStockRequest).toHaveBeenCalledTimes(1);
  });

  test('clears previous stock rows when a subsequent query returns no stock (C-4)', async () => {
    const validState: StoreState = {
      stockInfo: {
        stockInfoes: {
          information: { productNo: 'PROD-001', name: '布料A', category: '棉' },
          prevProduct: 'PREV-1',
          nextProduct: 'NEXT-1',
          result: [
            {
              stockIdentifier: { id: 1, productNo: 'PROD-001', lotNo: 'LOT-OLD', type: '板卷' },
              stockInfo: { defect: 'none' },
            },
          ],
          productList: [{ type: '板卷', quantity: 10, unit: '碼' }],
        },
      },
    };
    const emptyState: StoreState = {
      stockInfo: {
        stockInfoes: {
          information: { productNo: null },
          prevProduct: null,
          nextProduct: null,
          result: [],
          productList: [],
        },
      },
    };
    mockGetStockInfoes.mockResolvedValue({ status: 200 });

    const { rerender } = renderWithRedux(<ModifyBoard />, { initialState });
    fireEvent.change(screen.getByPlaceholderText('請輸入貨號進行搜尋...'), {
      target: { value: 'PROD-001', name: 'productNo' },
    });
    fireEvent.click(screen.getByText('查詢'));
    rerender(
      <Provider store={mockStore(validState)}>
        <ModifyBoard />
      </Provider>
    );

    expect(await screen.findByText('LOT-OLD')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('請輸入貨號進行搜尋...'), {
      target: { value: 'UNKNOWN-999', name: 'productNo' },
    });
    fireEvent.click(screen.getByText('查詢'));
    rerender(
      <Provider store={mockStore(emptyState)}>
        <ModifyBoard />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText('LOT-OLD')).not.toBeInTheDocument();
      expect(screen.getByText('查無庫存資料')).toBeInTheDocument();
    });
  });
});
