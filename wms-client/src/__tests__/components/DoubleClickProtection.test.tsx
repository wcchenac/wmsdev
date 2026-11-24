import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { toast } from 'react-toastify';
import rootReducer from '../../reducers';
import API from '../../utilities/API';
import { downloadFile } from '../../actions/FileActions';
import { DuplicateRequestError } from '../../utilities/requestDedup';
import { GET_Categories } from '../../types';
import ConfirmModal from '../../components/BO/Stock/OutStockList/ConfirmModal';
import ShipModal from '../../components/BO/Stock/Utilities/ShipModal';
import OutStockModal from '../../components/BO/Stock/ModifyStock/ModifyBoard/OutStockModal';
import ModifyBoard from '../../components/BO/Stock/ModifyStock/ModifyBoard/ModifyBoard';
import ModifyRequestBoard from '../../components/BO/Stock/ModifyStock/ShrinkBoard/ModifyRequestBoard';
import OutStockRequestList from '../../components/BO/Stock/OutStockList/OutStockRequestList';
import ScheduleMission from '../../components/BO/User/AdminPlatform/ScheduleMission';
import StockCategory from '../../components/BO/User/AdminPlatform/StockCategory';
import XlsxImportBoard from '../../components/BO/User/AdminPlatform/XlsxImportBoard';
import NormalStockBoard from '../../components/BO/Stock/InStock/NormalStockBoard';
import ShrinkBoard from '../../components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkBoard';
import UserManagement from '../../components/BO/User/AdminPlatform/UserManagement/UserManagement';
import InStockRollback from '../../components/BO/User/AdminPlatform/InStockRollback/InStockRollback';
import ShrinkRollback from '../../components/BO/User/AdminPlatform/ShrinkRollback/ShrinkRollback';
import Login from '../../components/BO/User/Login';
import { StockIdentifierType } from '../../enums/Enums';

vi.mock('../../utilities/API', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('react-toastify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-toastify')>();
  return { ...actual, toast: Object.assign(vi.fn(), { ...actual.toast, error: vi.fn(), success: vi.fn() }) };
});

vi.mock('@achmadk/react-loading-overlay', () => ({
  default: function MockLoadingOverlay({ active, children }: { active?: boolean; children: React.ReactNode }) {
    return (
      <div data-testid="loading-overlay" data-active={String(Boolean(active))}>
        {children}
      </div>
    );
  },
}));

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({
    rows,
    columns,
    checkboxSelection,
    rowSelectionModel,
    onRowSelectionModelChange,
  }: {
    rows: Array<Record<string, unknown> & { id: number | string }>;
    columns: Array<{ field: string; renderCell?: (p: { row: unknown }) => React.ReactNode }>;
    checkboxSelection?: boolean;
    rowSelectionModel?: { type: string; ids: Set<number | string> };
    onRowSelectionModelChange?: (model: { type: string; ids: Set<number | string> }) => void;
  }) => (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row.id)} data-testid={`row-${String(row.employeeId ?? row.id)}`}>
            {checkboxSelection ? (
              <td>
                <input
                  type="checkbox"
                  aria-label={`Select row ${row.id}`}
                  checked={rowSelectionModel?.ids?.has(row.id) ?? false}
                  onChange={() =>
                    onRowSelectionModelChange?.({ type: 'include', ids: new Set([row.id]) })
                  }
                />
              </td>
            ) : null}
            {columns.map((column) => (
              <td key={column.field}>{column.renderCell ? column.renderCell({ row }) : String(row[column.field] ?? '')}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

const makeStore = () => createStore(rootReducer, applyMiddleware(thunk));

describe('Single-user double-click protection across screens', () => {
  beforeEach(() => {
    vi.mocked(API.get).mockReset();
    vi.mocked(API.post).mockReset();
    vi.mocked(API.patch).mockReset();
    vi.mocked(API.put).mockReset();
    vi.mocked(API.delete).mockReset();
    vi.mocked(toast.error).mockReset();
    vi.mocked(toast.success).mockReset();
  });

  test('OutStockList ConfirmModal ignores rapid click+Enter and keeps Cancel safe on Enter', async () => {
    let resolveDelete!: () => void;
    const deleteOutStock = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        })
    );
    const handleModalClose = vi.fn();

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
        handleModalClose={handleModalClose}
        cancelShip={vi.fn()}
        deleteOutStock={deleteOutStock}
      />
    );

    const dialog = screen.getByRole('dialog');
    const cancelBtn = within(dialog).getByRole('button', { name: '取消' });
    fireEvent.keyDown(cancelBtn, { key: 'Enter', code: 'Enter' });
    expect(deleteOutStock).not.toHaveBeenCalled();

    const confirmBtn = within(dialog).getByRole('button', { name: '確認刪除' });
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);
    fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter' });

    expect(deleteOutStock).toHaveBeenCalledTimes(1);
    expect(within(dialog).getByRole('button', { name: /處理中/ })).toBeDisabled();

    await act(async () => {
      resolveDelete();
    });
    expect(within(dialog).getByRole('button', { name: '確認刪除' })).toBeEnabled();
  });

  test('ShipModal enforces isLoading lock and recovers after failure', async () => {
    const onShipClick = vi.fn();
    const { rerender } = render(
      <ShipModal
        show
        isLoading={false}
        outStockReason="中壢"
        handleModalClose={vi.fn()}
        onChange={vi.fn()}
        onReansonButtonChange={vi.fn()}
        onCancleShipClick={vi.fn()}
        onShipClick={onShipClick}
      />
    );

    const dialog = screen.getByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: '確認' });
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);
    expect(onShipClick).toHaveBeenCalledTimes(1);

    rerender(
      <ShipModal
        show
        isLoading={true}
        outStockReason="中壢"
        handleModalClose={vi.fn()}
        onChange={vi.fn()}
        onReansonButtonChange={vi.fn()}
        onCancleShipClick={vi.fn()}
        onShipClick={onShipClick}
      />
    );
    expect(within(dialog).getByRole('button', { name: '確認' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: '取消' })).toBeDisabled();

    rerender(
      <ShipModal
        show
        isLoading={false}
        outStockReason="中壢"
        handleModalClose={vi.fn()}
        onChange={vi.fn()}
        onReansonButtonChange={vi.fn()}
        onCancleShipClick={vi.fn()}
        onShipClick={onShipClick}
      />
    );
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }));
    expect(onShipClick).toHaveBeenCalledTimes(2);
  });

  test('ScheduleMission, StockCategory, XlsxImportBoard, and downloadFile dedup concurrent calls and recover', async () => {
    let resolveMission!: (val: { status: number; data: unknown }) => void;
    vi.mocked(API.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMission = resolve;
        })
    );

    const missionView = render(<ScheduleMission />);
    const compareBtn = screen.getByRole('button', { name: '每日比對' });
    const syncBtn = screen.getByRole('button', { name: '貨號類別同步' });
    fireEvent.click(compareBtn);
    fireEvent.click(compareBtn);
    fireEvent.click(syncBtn);
    expect(API.get).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveMission({ status: 200, data: {} });
    });
    expect(compareBtn).toBeEnabled();
    missionView.unmount();

    // StockCategory
    vi.mocked(API.get).mockReset();
    let resolveExport!: (val: { status: number; data: unknown }) => void;
    vi.mocked(API.get).mockImplementation((url: string) => {
      if (url.includes('categoryList')) {
        return Promise.resolve({ status: 200, data: [{ label: '棉', value: '棉' }] });
      }
      return new Promise((resolve) => {
        resolveExport = resolve;
      });
    });

    const store = makeStore();
    store.dispatch({ type: GET_Categories, payload: [{ label: '棉', value: '棉' }] });
    const categoryView = render(
      <Provider store={store}>
        <StockCategory />
      </Provider>
    );
    const input = categoryView.container.querySelector<HTMLInputElement>('input[id^="react-select"]')!;
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.click(categoryView.container.querySelector('[id*="-option-0"]')!);
    const exportBtn = screen.getByRole('button', { name: '送出' });
    fireEvent.click(exportBtn);
    fireEvent.click(exportBtn);
    expect(
      vi.mocked(API.get).mock.calls.filter(([url]) => String(url).includes('/category/'))
    ).toHaveLength(1);
    expect(exportBtn).toBeDisabled();
    await act(async () => {
      resolveExport({ status: 200, data: {} });
    });
    expect(exportBtn).toBeEnabled();
    categoryView.unmount();

    // XlsxImportBoard
    let rejectUpload!: (err: Error) => void;
    const uploadFiles = vi.fn(
      () =>
        new Promise((_resolve, reject) => {
          rejectUpload = reject;
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
    const uploadBtn = screen.getByRole('button', { name: '上傳' });
    fireEvent.click(uploadBtn);
    fireEvent.click(uploadBtn);
    expect(uploadFiles).toHaveBeenCalledTimes(1);
    expect(fileInput).toBeDisabled();
    await act(async () => {
      rejectUpload(new Error('upload failed'));
    });
    expect(uploadBtn).toBeEnabled();
    uploadView.unmount();

    // FileActions.downloadFile concurrent dedup
    vi.mocked(API.get).mockReset();
    let resolveDownload!: (val: { data: Blob; headers: Record<string, string> }) => void;
    vi.mocked(API.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDownload = resolve;
        })
    );
    const p1 = downloadFile('adjustment', 'report.xls');
    const p2 = downloadFile('adjustment', 'report.xls');
    expect(API.get).toHaveBeenCalledTimes(1);
    const createObj = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:url');
    const revokeObj = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    resolveDownload({ data: new Blob(['x']), headers: {} });
    await Promise.all([p1, p2]);
    createObj.mockRestore();
    revokeObj.mockRestore();
  });

  test('NormalStockBoard locks Step 3 double-clicks and clamps double clicks on 下一步/上一步', async () => {
    vi.mocked(API.get).mockResolvedValue({
      status: 200,
      data: {
        currentStatus: { P1: { 板卷: { quantity: '40.00', unit: '碼' } } },
        waitHandleStatus: { P1: { 板卷: { quantity: '40.00', unit: '碼' } } },
      },
    });
    let rejectPost!: (err: Error) => void;
    vi.mocked(API.post).mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectPost = reject;
        })
    );

    const store = makeStore();
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

    // Double clicking 下一步 must clamp at Step 3, never landing on blank step 4.
    const nextBtn = screen.getByRole('button', { name: '下一步' });
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    expect(container.querySelector('.nav-link.active')).toHaveTextContent('Step 3');

    const qtyInput = container.querySelector<HTMLInputElement>('input[placeholder="數量"]')!;
    fireEvent.change(qtyInput, { target: { value: '40', name: 'quantity' } });
    const submitBtn = screen.getByRole('button', { name: '送出' });
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);

    expect(API.post).toHaveBeenCalledTimes(1);
    expect(submitBtn).toBeDisabled();

    await act(async () => {
      rejectPost(new Error('500'));
    });
    expect(submitBtn).toBeEnabled();
  });

  test('ModifyBoard keeps ShipModal and InformationModal open with data on failure and dedups writes', async () => {
    vi.mocked(API.get).mockResolvedValue({
      status: 200,
      data: {
        information: { productNo: 'PROD-001', name: 'Test', category: '棉' },
        prevProduct: null,
        nextProduct: null,
        result: [
          {
            id: 501,
            color: 2,
            defect: 'GA',
            record: 'R1',
            remark: 'OLD',
            stockIdentifier: { id: 301, productNo: 'PROD-001', lotNo: 'LOT-1', type: '板卷', quantity: 10, unit: '碼', waitToShrink: false },
          },
        ],
        productList: [{ type: '板卷', quantity: 10, unit: '碼' }],
      },
    });

    let rejectPatch!: (err: Error) => void;
    vi.mocked(API.patch).mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectPatch = reject;
        })
    );

    render(
      <Provider store={makeStore()}>
        <ModifyBoard />
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('請輸入貨號進行搜尋...'), {
      target: { value: 'PROD-001', name: 'productNo' },
    });
    await act(async () => {
      fireEvent.click(screen.getByText('查詢'));
    });

    // ShipModal stays open & preserves reason on failure
    fireEvent.click(screen.getByRole('button', { name: '出庫' }));
    const shipDialog = await screen.findByRole('dialog');
    fireEvent.change(within(shipDialog).getByRole('textbox'), {
      target: { name: 'outStockReason', value: '中壢' },
    });
    const confirmShip = within(shipDialog).getByRole('button', { name: '確認' });
    fireEvent.click(confirmShip);
    fireEvent.click(confirmShip);

    expect(API.patch).toHaveBeenCalledTimes(1);
    expect(shipDialog).toBeInTheDocument();
    expect(confirmShip).toBeDisabled();

    await act(async () => {
      rejectPatch(new Error('500'));
    });
    expect(shipDialog).toBeInTheDocument();
    expect((within(shipDialog).getByRole('textbox') as HTMLInputElement).value).toBe('中壢');
    fireEvent.click(within(shipDialog).getByRole('button', { name: '取消' }));

    // InformationModal keeps edits on failure & locks controls while pending
    fireEvent.click(screen.getByRole('button', { name: '詳細資料' }));
    const infoDialog = await screen.findByRole('dialog');
    fireEvent.click(within(infoDialog).getByRole('button', { name: '編輯' }));
    const remarkInput = infoDialog.querySelector<HTMLInputElement>('input[name="remark"]')!;
    fireEvent.change(remarkInput, { target: { name: 'remark', value: 'KEEP-ME' } });
    const infoConfirm = within(infoDialog).getByRole('button', { name: '確認' });
    fireEvent.click(infoConfirm);
    fireEvent.click(infoConfirm);

    expect(API.patch).toHaveBeenCalledTimes(2);
    expect(infoConfirm).toBeDisabled();

    await act(async () => {
      rejectPatch(new Error('500'));
    });
    expect(infoDialog).toBeInTheDocument();
    expect(infoDialog.querySelector<HTMLInputElement>('input[name="remark"]')!.value).toBe('KEEP-ME');
    expect(infoConfirm).toBeEnabled();
    fireEvent.click(within(infoDialog).getByRole('button', { name: '取消編輯' }));
    fireEvent.click(within(infoDialog).getByRole('button', { name: 'Close' }));

    // Row 減肥 and BatchShipModal block double clicks
    const shrinkBtn = screen.getByRole('button', { name: '減肥' });
    fireEvent.click(shrinkBtn);
    fireEvent.click(shrinkBtn);
    expect(API.patch).toHaveBeenCalledTimes(3);
    await act(async () => {
      rejectPatch(new Error('500'));
    });

    fireEvent.click(screen.getByRole('button', { name: '批量出庫' }));
    const batchDialog = await screen.findByRole('dialog');
    fireEvent.click(within(batchDialog).getByRole('checkbox', { name: /Select row/i }));
    fireEvent.click(within(batchDialog).getByRole('button', { name: '中壢' }));
    const batchSave = within(batchDialog).getByRole('button', { name: '儲存選取項目' });
    fireEvent.click(batchSave);
    fireEvent.click(batchSave);
    expect(API.patch).toHaveBeenCalledTimes(4);
    await act(async () => {
      rejectPatch(new Error('500'));
    });
  });

  test('OutStockModal blocks synchronous double clicks and Enter reload', async () => {
    let resolveSubmit!: () => void;
    const handleCreate = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );
    render(
      <OutStockModal
        productNo="CF1001"
        show
        handleModalClose={vi.fn()}
        handleOutStockRequestCreate={handleCreate}
      />
    );
    const dialog = screen.getByRole('dialog');
    const form = dialog.querySelector('form')!;
    // Empty reason + Enter must be prevented and not submit
    expect(fireEvent.keyDown(form, { key: 'Enter', code: 'Enter' })).toBe(false);
    expect(handleCreate).not.toHaveBeenCalled();

    fireEvent.change(dialog.querySelector('input[name=outStockReason]')!, {
      target: { value: '中壢', name: 'outStockReason' },
    });
    const btn = within(dialog).getByRole('button', { name: '儲存至明細' });
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.keyDown(form, { key: 'Enter', code: 'Enter' });
    expect(handleCreate).toHaveBeenCalledTimes(1);
    expect(dialog.querySelector('input[name=outStockReason]')).toBeDisabled();

    await act(async () => {
      resolveSubmit();
    });
    expect(within(dialog).getByRole('button', { name: '儲存至明細' })).toBeEnabled();
  });

  test('ShrinkBoard & ModifyRequestBoard keep ShrinkConfirmModal locked until settle and lock 取消減肥', async () => {
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

    const shrinkView = render(
      <Provider store={makeStore()}>
        <ShrinkBoard />
      </Provider>
    );
    await act(async () => {});

    const cancelBtn = await screen.findByRole('button', { name: '取消減肥' });
    fireEvent.click(cancelBtn);
    fireEvent.click(cancelBtn);
    expect(API.patch).toHaveBeenCalledTimes(1);
    expect(cancelBtn).toBeDisabled();
    await act(async () => {
      resolvePatch({ status: 200, data: {} });
    });
    shrinkView.unmount();

    // ModifyRequestBoard + ShrinkConfirmModal keeps dialog open while promise pending
    let resolveSubmit!: () => void;
    const handleModifyRequestSubmit = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveSubmit = () => resolve(true);
        })
    );
    const { container } = render(
      <ModifyRequestBoard
        stockInfo={{
          color: 1,
          defect: '',
          record: '',
          stockIdentifier: { id: 77, productNo: 'CF500', lotNo: 'L1', type: StockIdentifierType.roll, quantity: 20, unit: '碼' },
        }}
        typeExchange={false}
        sameTypeModify={true}
        hardwareModify={false}
        isLoading={false}
        handleGoBack={vi.fn()}
        handleModifyRequestSubmit={handleModifyRequestSubmit}
      />
    );
    const qtyInputs = container.querySelectorAll<HTMLInputElement>('input[name="quantity"]:not([disabled])');
    fireEvent.change(qtyInputs[0], { target: { name: 'quantity', value: '12' } });
    fireEvent.change(qtyInputs[1], { target: { name: 'quantity', value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: '送出' }));

    const dialog = screen.getByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: '送出' });
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);
    expect(handleModifyRequestSubmit).toHaveBeenCalledTimes(1);
    expect(dialog).toBeInTheDocument();

    await act(async () => {
      resolveSubmit();
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  test('UserManagement keeps EditModal open on failure and blocks double delete & list load', async () => {
    let resolveGet!: (val: { status: number; data: unknown }) => void;
    vi.mocked(API.get).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveGet = resolve;
        })
    );
    let rejectPatch!: (err: Error) => void;
    vi.mocked(API.patch).mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectPatch = reject;
        })
    );
    let resolveDelete!: (val: { status: number; data: unknown }) => void;
    vi.mocked(API.delete).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve;
        })
    );

    render(
      <Provider store={makeStore()}>
        <UserManagement />
      </Provider>
    );
    const loadBtn = screen.getByRole('button', { name: '讀取員工清單' });
    fireEvent.click(loadBtn);
    fireEvent.click(loadBtn);
    expect(API.get).toHaveBeenCalledTimes(1);
    expect(loadBtn).toBeDisabled();
    await act(async () => {
      resolveGet({
        status: 200,
        data: [{ employeeId: 'E001', fullName: '王小明', role: '業務' }],
      });
    });

    fireEvent.click(within(screen.getByTestId('row-E001')).getByRole('button', { name: '編輯' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '編輯' }));
    fireEvent.change(dialog.querySelector('input[name="newPassword"]')!, {
      target: { name: 'newPassword', value: 'secret123' },
    });

    const saveBtn = within(dialog).getByRole('button', { name: '儲存' });
    fireEvent.click(saveBtn);
    fireEvent.click(saveBtn);
    expect(API.patch).toHaveBeenCalledTimes(1);
    expect(within(dialog).getByRole('button', { name: '儲存中...' })).toBeDisabled();

    await act(async () => {
      rejectPatch(new Error('500'));
    });
    // Remains open with edited password intact for retry
    expect(dialog).toBeInTheDocument();
    expect(dialog.querySelector<HTMLInputElement>('input[name="newPassword"]')!.value).toBe('secret123');
    expect(within(dialog).getByRole('button', { name: '儲存' })).toBeEnabled();
    fireEvent.click(within(dialog).getByRole('button', { name: '取消' }));

    // ConfirmDialog double delete
    fireEvent.click(within(screen.getByTestId('row-E001')).getByRole('button', { name: '刪除' }));
    const delDialog = screen.getByRole('dialog');
    const delBtn = within(delDialog).getByRole('button', { name: '刪除' });
    fireEvent.click(delBtn);
    fireEvent.click(delBtn);
    expect(API.delete).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveDelete({ status: 200, data: '' });
    });
    expect(loadBtn).toBeEnabled();
  });

  test('InStockRollback and ShrinkRollback lock RollbackModal and block double submits', async () => {
    vi.mocked(API.get).mockResolvedValue({
      status: 200,
      data: {
        CF1001: [
          {
            defect: '',
            record: '',
            remark: '',
            stockIdentifier: { id: 1, productNo: 'CF1001', lotNo: 'L1', type: '板卷', quantity: 5, unit: '碼', exist: true },
          },
        ],
      },
    });
    let rejectPatch!: (err: Error) => void;
    vi.mocked(API.patch).mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectPatch = reject;
        })
    );

    const view1 = render(
      <Provider store={makeStore()}>
        <InStockRollback />
      </Provider>
    );
    fireEvent.change(view1.container.querySelector('select[name=orderType]')!, {
      target: { name: 'orderType', value: 'normal' },
    });
    fireEvent.change(view1.container.querySelector('input[name=orderNo]')!, {
      target: { name: 'orderNo', value: 'IN001' },
    });
    await act(async () => {
      fireEvent.submit(view1.container.querySelector('form')!);
    });
    fireEvent.click(screen.getByRole('button', { name: '詳細資料' }));
    const confirm1 = within(screen.getByRole('dialog')).getByRole('button', { name: '確認' });
    fireEvent.click(confirm1);
    fireEvent.click(confirm1);
    expect(API.patch).toHaveBeenCalledTimes(1);
    expect(confirm1).toBeDisabled();
    await act(async () => {
      rejectPatch(new Error('500'));
    });
    view1.unmount();

    vi.mocked(API.get).mockReset().mockResolvedValue({
      status: 200,
      data: [
        {
          stockInfo: {
            stockIdentifier: { id: 10, productNo: 'CF1001', lotNo: 'L1', type: '板卷', quantity: 5, unit: '碼', eliminateDate: '2026-11-20' },
          },
          nodes: [
            {
              stockInfo: {
                defect: '',
                record: '',
                remark: '',
                stockIdentifier: { id: 11, productNo: 'CF1001', lotNo: 'C1', type: '板卷', quantity: 5, unit: '碼', exist: true },
              },
            },
          ],
        },
      ],
    });
    vi.mocked(API.patch).mockReset().mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectPatch = reject;
        })
    );

    const view2 = render(
      <Provider store={makeStore()}>
        <ShrinkRollback />
      </Provider>
    );
    const prodInput = view2.container.querySelector<HTMLInputElement>('#productNo-search')!;
    fireEvent.change(prodInput, { target: { name: 'productNo', value: 'CF1001' } });
    await act(async () => {
      fireEvent.submit(prodInput.closest('form')!);
    });
    fireEvent.click(screen.getByRole('button', { name: '詳細資料' }));
    const confirm2 = within(screen.getByRole('dialog')).getByRole('button', { name: '確認' });
    fireEvent.click(confirm2);
    fireEvent.click(confirm2);
    expect(API.patch).toHaveBeenCalledTimes(1);
    expect(confirm2).toBeDisabled();
    await act(async () => {
      rejectPatch(new Error('500'));
    });
    view2.unmount();
  });

  test('OutStockRequestList disables reset/save, refreshes after cancelShip/update, and Login ignores double submits & DuplicateRequestError', async () => {
    const today = new Date().toJSON().slice(0, 10);
    vi.mocked(API.get).mockResolvedValue({
      status: 200,
      data: {
        userList: ['林倉管'],
        queryResult: {
          [today]: [
            {
              id: 11, productNo: 'CF1001', lotNo: 'L1', type: '整支', quantity: 5, unit: '碼',
              reason: '中壢', outStockType: 0, stockIdentifierId: 3, fileName: '', handled: false, deleted: false,
              requestFrom: '中壢', createdBy: '林倉管',
            },
          ],
        },
      },
    });
    let resolvePatch!: (val: { status: number; data: unknown }) => void;
    vi.mocked(API.patch).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePatch = resolve;
        })
    );

    const listView = render(
      <Provider store={makeStore()}>
        <OutStockRequestList />
      </Provider>
    );
    await act(async () => {});
    fireEvent.change(screen.getByRole('combobox', { name: '選擇倉別' }), {
      target: { name: 'whName', value: '內倉' },
    });
    const saveBtn = screen.getByRole('button', { name: '儲存' });
    fireEvent.click(saveBtn);
    fireEvent.click(saveBtn);
    expect(API.patch).toHaveBeenCalledTimes(1);
    expect(saveBtn).toBeDisabled();
    expect(screen.getByRole('button', { name: /頁面初始化/ })).toBeDisabled();
    await act(async () => {
      resolvePatch({ status: 200, data: {} });
    });
    await act(async () => {});
    expect(API.get).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: /頁面初始化/ })).toBeEnabled();

    // Cancel-ship ConfirmModal (outStockType: 0) double click + post-mutation refresh
    fireEvent.click(screen.getByRole('button', { name: '取消出貨' }));
    const cancelShipDialog = await screen.findByRole('dialog');
    const confirmCancelShip = within(cancelShipDialog).getByRole('button', { name: '確認取消' });
    fireEvent.click(confirmCancelShip);
    fireEvent.click(confirmCancelShip);
    expect(API.patch).toHaveBeenCalledTimes(2);
    await act(async () => {
      resolvePatch({ status: 200, data: {} });
    });
    await act(async () => {});
    expect(API.get).toHaveBeenCalledTimes(3);
    listView.unmount();

    // Login double submit & DuplicateRequestError suppression
    vi.mocked(API.post).mockRejectedValueOnce(new DuplicateRequestError());
    const store = makeStore();
    const loginView = render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );
    fireEvent.change(loginView.container.querySelector('#employeeId')!, {
      target: { name: 'employeeId', value: 'E001' },
    });
    fireEvent.change(loginView.container.querySelector('#password')!, {
      target: { name: 'password', value: 'pw' },
    });
    await act(async () => {
      const form = loginView.container.querySelector('form')!;
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    expect(API.post).toHaveBeenCalledTimes(1);
    expect(store.getState().errors.errors).toBeNull();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
