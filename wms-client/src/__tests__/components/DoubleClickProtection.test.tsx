import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../reducers';
import API from '../../utilities/API';
import { GET_Categories } from '../../types';
import ConfirmModal from '../../components/BO/Stock/OutStockList/ConfirmModal';
import ShipModal from '../../components/BO/Stock/Utilities/ShipModal';
import ScheduleMission from '../../components/BO/User/AdminPlatform/ScheduleMission';
import StockCategory from '../../components/BO/User/AdminPlatform/StockCategory';
import XlsxImportBoard from '../../components/BO/User/AdminPlatform/XlsxImportBoard';
import NormalStockBoard from '../../components/BO/Stock/InStock/NormalStockBoard';
import ShrinkBoard from '../../components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkBoard';

vi.mock('../../utilities/API', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('react-toastify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-toastify')>();
  return { ...actual, toast: Object.assign(vi.fn(), { ...actual.toast, error: vi.fn(), success: vi.fn() }) };
});

vi.mock('@achmadk/react-loading-overlay', () => ({
  default: function MockLoadingOverlay({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

describe('Single-user double-click protection across screens', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('OutStockList ConfirmModal ignores rapid click + Enter while pending', async () => {
    let resolveDelete!: () => void;
    const deleteOutStock = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        })
    );

    render(
      <ConfirmModal
        show
        searchInfo={{
          id: 42,
          stockIdentifierId: 9,
          outStockType: 2,
          productNo: 'CF1001',
          type: '板卷',
          quantity: 10,
          unit: '碼',
          reason: '中壢',
          createdBy: 'E001',
          handled: false,
          fileName: '',
        }}
        handleModalClose={vi.fn()}
        cancelShip={vi.fn()}
        deleteOutStock={deleteOutStock}
      />
    );

    const dialog = screen.getByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: '確認刪除' });
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);
    fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter' });

    expect(deleteOutStock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveDelete();
    });
  });

  test('ShipModal ignores rapid double clicks on confirm', () => {
    const onShipClick = vi.fn();
    render(
      <ShipModal
        show
        outStockReason="中壢"
        handleModalClose={vi.fn()}
        onChange={vi.fn()}
        onReansonButtonChange={vi.fn()}
        onCancleShipClick={vi.fn()}
        onShipClick={onShipClick}
      />
    );

    const confirmBtn = within(screen.getByRole('dialog')).getByRole('button', { name: '確認' });
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);

    expect(onShipClick).toHaveBeenCalledTimes(1);
  });

  test('ScheduleMission, StockCategory, and XlsxImportBoard ignore concurrent clicks', async () => {
    let resolveGet!: (val: { status: number; data: unknown }) => void;
    vi.mocked(API.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveGet = resolve;
        })
    );

    render(<ScheduleMission />);
    const compareBtn = screen.getByRole('button', { name: '每日比對' });
    fireEvent.click(compareBtn);
    fireEvent.click(compareBtn);
    expect(API.get).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveGet({ status: 200, data: {} });
    });

    vi.mocked(API.get).mockClear();
    const store = createStore(rootReducer, applyMiddleware(thunk));
    store.dispatch({ type: GET_Categories, payload: [{ label: '棉', value: '棉' }] });
    vi.mocked(API.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveGet = resolve;
        })
    );
    const { container } = render(
      <Provider store={store}>
        <StockCategory />
      </Provider>
    );
    const input = container.querySelector<HTMLInputElement>('input[id^="react-select"]')!;
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.click(container.querySelector('[id*="-option-0"]')!);
    const exportBtn = screen.getByRole('button', { name: '送出' });
    fireEvent.click(exportBtn);
    fireEvent.click(exportBtn);
    expect(API.get).toHaveBeenCalledWith('/api/stock/queryStock/category/%E6%A3%89');
    expect(
      vi.mocked(API.get).mock.calls.filter(([url]) => String(url).includes('/category/'))
    ).toHaveLength(1);
    await act(async () => {
      resolveGet({ status: 200, data: {} });
    });

    let resolveUpload!: (val: unknown) => void;
    const uploadFiles = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveUpload = resolve;
        })
    );
    const uploadView = render(<XlsxImportBoard uploadFiles={uploadFiles} />);
    const fileInput = uploadView.container.querySelector<HTMLInputElement>('input[type=file]')!;
    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(['x'], 'in.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        ],
      },
    });
    const uploadBtn = uploadView.getByRole('button', { name: '上傳' });
    fireEvent.click(uploadBtn);
    fireEvent.click(uploadBtn);
    expect(uploadFiles).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveUpload({ status: 200 });
    });
  });

  test('NormalStockBoard locks Step 3 submission synchronously against double-clicks', async () => {
    vi.mocked(API.get).mockResolvedValue({
      status: 200,
      data: {
        currentStatus: { P1: { 板卷: { quantity: '40.00', unit: '碼' } } },
        waitHandleStatus: { P1: { 板卷: { quantity: '40.00', unit: '碼' } } },
      },
    });
    let resolvePost!: (val: { status: number; data: unknown }) => void;
    vi.mocked(API.post).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        })
    );

    const store = createStore(rootReducer, applyMiddleware(thunk));
    const { container } = render(
      <Provider store={store}>
        <NormalStockBoard />
      </Provider>
    );

    const orderInput = container.querySelector<HTMLInputElement>('input[name=orderNo]')!;
    fireEvent.change(orderInput, { target: { value: 'IN001', name: 'orderNo' } });
    await act(async () => {
      fireEvent.submit(orderInput.closest('form')!);
    });
    fireEvent.click(screen.getByRole('button', { name: '下一步' }));

    const qtyInput = container.querySelector<HTMLInputElement>('input[placeholder="數量"]')!;
    fireEvent.change(qtyInput, { target: { value: '40', name: 'quantity' } });
    const submitBtn = screen.getByRole('button', { name: '送出' });
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);

    expect(API.post).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePost({ status: 200, data: {} });
    });
  });

  test('ShrinkBoard ignores rapid double clicks on 取消減肥', async () => {
    vi.mocked(API.get).mockResolvedValue({
      status: 200,
      data: [
        {
          id: 1,
          color: '1',
          defect: '',
          record: '',
          remark: '',
          stockIdentifier: { id: 99, productNo: 'CF1001', lotNo: 'L1', type: '板卷', quantity: 10, unit: '碼' },
        },
      ],
    });
    let resolvePatch!: (val: { status: number; data: unknown }) => void;
    vi.mocked(API.patch).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePatch = resolve;
        })
    );

    const store = createStore(rootReducer, applyMiddleware(thunk));
    render(
      <Provider store={store}>
        <ShrinkBoard />
      </Provider>
    );
    await act(async () => {});

    const cancelBtn = await screen.findByRole('button', { name: /取消/ });
    fireEvent.click(cancelBtn);
    fireEvent.click(cancelBtn);

    expect(API.patch).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePatch({ status: 200, data: {} });
    });
  });
});
