import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { toast } from 'react-toastify';
import InStockByImportFile from '../../../../../components/BO/User/AdminPlatform/InStockByImportFile';
import SetWarehouse from '../../../../../components/BO/User/AdminPlatform/SetWarehouse';
import * as FileActions from '../../../../../actions/FileActions';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock('../../../../../actions/FileActions', () => ({
  inStockByImportFile: vi.fn(),
  setWHByImportFile: vi.fn(),
}));

describe.each([
  ['InStockByImportFile', InStockByImportFile, 'inStockByImportFile'],
  ['SetWarehouse', SetWarehouse, 'setWHByImportFile'],
] as const)('%s import upload flow (H-20)', (_name, Component, actionName) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('rejects non-xlsx file and disables submit button', () => {
    const { container } = render(<Component />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const uploadBtn = screen.getByRole('button', { name: '上傳' });

    expect(uploadBtn).toBeDisabled();

    const csvFile = new File(['a,b'], 'bad.csv', { type: 'text/csv' });
    fireEvent.change(input, { target: { files: [csvFile] } });

    expect(toast.error).toHaveBeenCalled();
    expect(uploadBtn).toBeDisabled();
  });

  test('uploads selected xlsx FormData and shows success toast', async () => {
    vi.mocked(FileActions[actionName]).mockResolvedValue({ status: 200 } as never);
    const { container } = render(<Component />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const uploadBtn = screen.getByRole('button', { name: '上傳' });

    const xlsxFile = new File(['xlsx-bytes'], 'import.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    fireEvent.change(input, { target: { files: [xlsxFile] } });
    expect(uploadBtn).toBeEnabled();

    await act(async () => {
      fireEvent.click(uploadBtn);
    });

    expect(FileActions[actionName]).toHaveBeenCalledTimes(1);
    const submittedForm = vi.mocked(FileActions[actionName]).mock.calls[0][0] as FormData;
    expect(submittedForm.get('files')).toBe(xlsxFile);
    expect(toast.success).toHaveBeenCalledWith('upload success');
  });

  test('shows failure toast when upload rejects with non-401 error', async () => {
    vi.mocked(FileActions[actionName]).mockRejectedValue({ response: { status: 500 } });
    const { container } = render(<Component />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;

    const xlsxFile = new File(['xlsx-bytes'], 'import.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    fireEvent.change(input, { target: { files: [xlsxFile] } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '上傳' }));
    });

    expect(toast.error).toHaveBeenCalledWith('upload fail');
  });
});
