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
  waitToShrink?: boolean;
}

interface StockInfoResult {
  id?: number;
  defect?: string;
  color?: number;
  record?: string;
  remark?: string;
  stockIdentifier: StockIdentifier;
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
  stockIdentifierWaitToShrinkIsTrue: (id: number) => () => mockStockIdentifierWaitToShrinkIsTrue(id),
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
                type: '雜項'
              },
              defect: 'none'
            }
          ],
          productList: [
            { type: '雜項', quantity: 10, unit: '個' }
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
                type: '整支' // To enable the button
              },
              defect: 'none'
            }
          ],
          productList: [
            { type: '整支', quantity: 10, unit: '碼' }
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
          result: [{ stockIdentifier: { productNo: 'PROD-001', type: '整支' }, defect: 'none' }],
          productList: [{ type: '整支', quantity: 10, unit: '碼' }],
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
              defect: 'none',
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

  test('excludes waitToShrink items from BatchShipModal and disables 批量出庫 when all shrink (C-6)', async () => {
    const mixedState: StoreState = {
      stockInfo: {
        stockInfoes: {
          information: { productNo: 'PROD-001' },
          prevProduct: null,
          nextProduct: null,
          result: [
            {
              stockIdentifier: { id: 1, productNo: 'PROD-001', lotNo: 'LOT-READY', type: '板卷', waitToShrink: false },
              defect: 'none',
            },
            {
              stockIdentifier: { id: 2, productNo: 'PROD-001', lotNo: 'LOT-SHRINKING', type: '板卷', waitToShrink: true },
              defect: 'none',
            },
          ],
          productList: [{ type: '板卷', quantity: 10, unit: '碼' }],
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
      <Provider store={mockStore(mixedState)}>
        <ModifyBoard />
      </Provider>
    );

    const batchBtn = await screen.findByRole('button', { name: '批量出庫' });
    expect(batchBtn).toBeEnabled();
    fireEvent.click(batchBtn);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('LOT-READY')).toBeInTheDocument();
    expect(within(dialog).queryByText('LOT-SHRINKING')).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: '取消' }));

    const allShrinkingState: StoreState = {
      stockInfo: {
        stockInfoes: {
          information: { productNo: 'PROD-001' },
          prevProduct: null,
          nextProduct: null,
          result: [
            {
              stockIdentifier: { id: 2, productNo: 'PROD-001', lotNo: 'LOT-SHRINKING', type: '板卷', waitToShrink: true },
              defect: 'none',
            },
          ],
          productList: [{ type: '板卷', quantity: 5, unit: '碼' }],
        },
      },
    };
    rerender(
      <Provider store={mockStore(allShrinkingState)}>
        <ModifyBoard />
      </Provider>
    );

    expect(screen.getByRole('button', { name: '批量出庫' })).toBeDisabled();
  });

  test('shipping row 0 does not leak its outStockReason into row 1 after list update', async () => {
    const twoRowsState: StoreState = {
      stockInfo: {
        stockInfoes: {
          information: { productNo: 'PROD-001' },
          prevProduct: null,
          nextProduct: null,
          result: [
            {
              stockIdentifier: { id: 101, productNo: 'PROD-001', lotNo: 'LOT-A', type: '板卷', waitToShrink: false },
              defect: 'none',
            },
            {
              stockIdentifier: { id: 102, productNo: 'PROD-001', lotNo: 'LOT-B', type: '板卷', waitToShrink: false },
              defect: 'none',
            },
          ],
          productList: [{ type: '板卷', quantity: 20, unit: '碼' }],
        },
      },
    };
    const oneRowState: StoreState = {
      stockInfo: {
        stockInfoes: {
          ...twoRowsState.stockInfo.stockInfoes,
          result: [twoRowsState.stockInfo.stockInfoes.result[1]],
          productList: [{ type: '板卷', quantity: 10, unit: '碼' }],
        },
      },
    };
    mockStockIdentifierIsShiped.mockResolvedValue({ status: 200 });
    mockGetStockInfoes.mockResolvedValue({ status: 200 });

    const { rerender } = renderWithRedux(<ModifyBoard />, { initialState });
    fireEvent.change(screen.getByPlaceholderText('請輸入貨號進行搜尋...'), {
      target: { value: 'PROD-001', name: 'productNo' },
    });
    fireEvent.click(screen.getByText('查詢'));
    rerender(
      <Provider store={mockStore(twoRowsState)}>
        <ModifyBoard />
      </Provider>
    );

    const shipButtons = await screen.findAllByRole('button', { name: '出庫' });
    fireEvent.click(shipButtons[0]);

    const dialog1 = await screen.findByRole('dialog');
    const reasonInput = within(dialog1).getByRole('textbox') as HTMLInputElement;
    fireEvent.change(reasonInput, { target: { name: 'outStockReason', value: '中壢' } });
    fireEvent.click(within(dialog1).getByRole('button', { name: '確認' }));

    rerender(
      <Provider store={mockStore(oneRowState)}>
        <ModifyBoard />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: '出庫' }));
    const dialog2 = await screen.findByRole('dialog');
    expect((within(dialog2).getByRole('textbox') as HTMLInputElement).value).toBe('');
  });

  test('batch ship flow submits selected stockIdentifier ids and closes modal', async () => {
    const readyState: StoreState = {
      stockInfo: {
        stockInfoes: {
          information: { productNo: 'PROD-001' },
          prevProduct: null,
          nextProduct: null,
          result: [
            {
              stockIdentifier: { id: 301, productNo: 'PROD-001', lotNo: 'LOT-1', type: '板卷', waitToShrink: false },
              defect: 'none',
            },
          ],
          productList: [{ type: '板卷', quantity: 10, unit: '碼' }],
        },
      },
    };
    mockStockIdentifiersAreShiped.mockResolvedValue({ status: 200 });
    mockGetStockInfoes.mockResolvedValue({ status: 200 });

    const { rerender } = renderWithRedux(<ModifyBoard />, { initialState });
    fireEvent.change(screen.getByPlaceholderText('請輸入貨號進行搜尋...'), {
      target: { value: 'PROD-001', name: 'productNo' },
    });
    fireEvent.click(screen.getByText('查詢'));
    rerender(
      <Provider store={mockStore(readyState)}>
        <ModifyBoard />
      </Provider>
    );

    fireEvent.click(await screen.findByRole('button', { name: '批量出庫' }));
    const dialog = await screen.findByRole('dialog');
    const checkbox = within(dialog).getByRole('checkbox', { name: /select row/i });
    fireEvent.click(checkbox);
    const reasonInput = dialog.querySelector<HTMLInputElement>('input[name="outStockReason"]')!;
    fireEvent.change(reasonInput, { target: { name: 'outStockReason', value: '新竹' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '儲存選取項目' }));

    await waitFor(() => {
      expect(mockStockIdentifiersAreShiped).toHaveBeenCalledWith('PROD-001', [
        { stockIdentifierId: 301, reason: '新竹' },
      ]);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('handleShrink calls stockIdentifierWaitToShrinkIsTrue with numeric id', async () => {
    const readyState: StoreState = {
      stockInfo: {
        stockInfoes: {
          information: { productNo: 'PROD-001' },
          prevProduct: null,
          nextProduct: null,
          result: [
            {
              id: 501,
              defect: 'GA',
              stockIdentifier: { id: 301, productNo: 'PROD-001', lotNo: 'LOT-1', type: '板卷', waitToShrink: false },
            },
          ],
          productList: [{ type: '板卷', quantity: 10, unit: '碼' }],
        },
      },
    };
    mockGetStockInfoes.mockResolvedValue({ status: 200 });
    mockStockIdentifierWaitToShrinkIsTrue.mockResolvedValue({ status: 200 });

    const { rerender } = renderWithRedux(<ModifyBoard />, { initialState });
    fireEvent.change(screen.getByPlaceholderText('請輸入貨號進行搜尋...'), {
      target: { value: 'PROD-001', name: 'productNo' },
    });
    fireEvent.click(screen.getByText('查詢'));
    rerender(
      <Provider store={mockStore(readyState)}>
        <ModifyBoard />
      </Provider>
    );

    fireEvent.click(await screen.findByRole('button', { name: '減肥' }));
    await waitFor(() => {
      expect(mockStockIdentifierWaitToShrinkIsTrue).toHaveBeenCalledWith(301);
    });
  });

  test('handleStockInfoUpdate opens InformationModal, switches to edit mode, and submits updateStockInfo', async () => {
    const readyState: StoreState = {
      stockInfo: {
        stockInfoes: {
          information: { productNo: 'PROD-001' },
          prevProduct: null,
          nextProduct: null,
          result: [
            {
              id: 501,
              color: 2,
              defect: 'GA',
              record: 'R-OLD',
              remark: 'OLD-REMARK',
              stockIdentifier: { id: 301, productNo: 'PROD-001', lotNo: 'LOT-1', type: '板卷', waitToShrink: false },
            },
          ],
          productList: [{ type: '板卷', quantity: 10, unit: '碼' }],
        },
      },
    };
    mockGetStockInfoes.mockResolvedValue({ status: 200 });
    mockUpdateStockInfo.mockResolvedValue({ status: 200 });

    const { rerender } = renderWithRedux(<ModifyBoard />, { initialState });
    fireEvent.change(screen.getByPlaceholderText('請輸入貨號進行搜尋...'), {
      target: { value: 'PROD-001', name: 'productNo' },
    });
    fireEvent.click(screen.getByText('查詢'));
    rerender(
      <Provider store={mockStore(readyState)}>
        <ModifyBoard />
      </Provider>
    );

    fireEvent.click(await screen.findByRole('button', { name: '詳細資料' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '編輯' }));

    const remarkInput = dialog.querySelector<HTMLInputElement>('input[name="remark"]')!;
    fireEvent.change(remarkInput, { target: { name: 'remark', value: 'NEW-REMARK' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }));

    await waitFor(() => {
      expect(mockUpdateStockInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 501,
          remark: 'NEW-REMARK',
          defect: 'GA',
          record: 'R-OLD',
        })
      );
    });
  });
});
