import React from 'react';
import type { ChangeEvent } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { toast } from 'react-toastify';
import { inStockByImportFile, setWHByImportFile } from '../../../../../actions/FileActions';
import InStockByImportFile from '../../../../../components/BO/User/AdminPlatform/InStockByImportFile';
import SetWarehouse from '../../../../../components/BO/User/AdminPlatform/SetWarehouse';
import {
  acceptXlsxSelection,
  xlsxImportErrorMessages,
} from '../../../../../components/BO/User/AdminPlatform/xlsxImport';

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('../../../../../actions/FileActions', () => ({
  inStockByImportFile: vi.fn(() => Promise.resolve({ status: 200 })),
  setWHByImportFile: vi.fn(() => Promise.resolve({ status: 200 })),
}));

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function xlsx(name: string, type: string): File {
  return new File(['sheet'], name, { type });
}

function selectFiles(input: HTMLInputElement, files: File[]): void {
  // A FileList stand-in: indexed files plus length and item().
  const list = {
    ...files,
    length: files.length,
    item: (index: number) => files[index] ?? null,
  };
  Object.defineProperty(input, 'files', { configurable: true, value: list });
  fireEvent.change(input);
}

function fileInput(): HTMLInputElement {
  const input = document.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('file input was not rendered');
  }
  return input;
}

describe('xlsxImportErrorMessages', () => {
  test('skips holes so a sparse list does not report an empty message', () => {
    const files: Array<File | undefined> = [];
    files[1] = xlsx('notes.txt', 'text/plain');

    const messages = xlsxImportErrorMessages(files);

    expect(messages).toEqual(['text/plain is not a supported format\n']);
    expect(messages).not.toContain(undefined);
  });

  test('accepts .xlsx with an empty type or application/octet-stream', () => {
    expect(xlsxImportErrorMessages([xlsx('a.xlsx', '')])).toEqual([]);
    expect(xlsxImportErrorMessages([xlsx('b.XLSX', 'application/octet-stream')])).toEqual([]);
    expect(xlsxImportErrorMessages([xlsx('c.xlsx', XLSX_MIME)])).toEqual([]);
  });

  test('rejects a non-xlsx extension even when the MIME is the spreadsheet type', () => {
    expect(xlsxImportErrorMessages([xlsx('c.xls', XLSX_MIME)])).toEqual([
      `${XLSX_MIME} is not a supported format\n`,
    ]);
  });
});

describe('acceptXlsxSelection', () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
  });

  test('returns false and toasts only real messages for a bad file', () => {
    const files: Array<File | undefined> = [];
    files[0] = xlsx('ok.xlsx', XLSX_MIME);
    files[2] = xlsx('bad.txt', 'text/plain');
    const event = {
      target: { files, value: 'chosen' },
    } as unknown as ChangeEvent<HTMLInputElement>;

    expect(acceptXlsxSelection(event)).toBe(false);
    expect(event.target.value).toBe('');
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('text/plain is not a supported format\n');
    expect(toast.error).not.toHaveBeenCalledWith(undefined);
  });

  test('returns false for an empty selection and does not toast', () => {
    const event = {
      target: { files: { length: 0 }, value: '' },
    } as unknown as ChangeEvent<HTMLInputElement>;

    expect(acceptXlsxSelection(event)).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('returns true for an accepted .xlsx and leaves the input alone', () => {
    const files = [xlsx('book.xlsx', '')];
    const event = {
      target: { files, value: 'book.xlsx' },
    } as unknown as ChangeEvent<HTMLInputElement>;

    expect(acceptXlsxSelection(event)).toBe(true);
    expect(event.target.value).toBe('book.xlsx');
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe.each([
  ['in-stock import', InStockByImportFile, inStockByImportFile, setWHByImportFile],
  ['set warehouse', SetWarehouse, setWHByImportFile, inStockByImportFile],
] as const)('%s', (_label, Page, upload, otherUpload) => {
  beforeEach(() => {
    vi.mocked(upload).mockClear().mockResolvedValue({ status: 200 } as Awaited<ReturnType<typeof upload>>);
    vi.mocked(otherUpload).mockClear();
    vi.mocked(toast.error).mockClear();
    vi.mocked(toast.success).mockClear();
  });

  test('posts nothing and stays disabled when no file is selected', () => {
    render(<Page />);
    const button = screen.getByRole('button', { name: '上傳' });
    expect(button).toBeDisabled();
    expect(fileInput()).toHaveAttribute('accept', '.xlsx');

    fireEvent.click(button);

    expect(upload).not.toHaveBeenCalled();
    expect(otherUpload).not.toHaveBeenCalled();
  });

  test('rejects a bad file, shows no name, and posts nothing', () => {
    render(<Page />);
    selectFiles(fileInput(), [xlsx('notes.txt', 'text/plain')]);

    expect(toast.error).toHaveBeenCalledWith('text/plain is not a supported format\n');
    expect(toast.error).not.toHaveBeenCalledWith(undefined);
    expect(screen.queryByText('notes.txt')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '上傳' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '上傳' }));
    expect(upload).not.toHaveBeenCalled();
  });

  test('accepts an .xlsx the browser types as octet-stream and posts that file', () => {
    render(<Page />);
    selectFiles(fileInput(), [xlsx('stock.xlsx', 'application/octet-stream')]);

    expect(screen.getByText('stock.xlsx')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '上傳' }));

    expect(upload).toHaveBeenCalledTimes(1);
    expect(otherUpload).not.toHaveBeenCalled();
    const body = vi.mocked(upload).mock.calls[0][0];
    const posted = body.getAll('files');
    expect(posted).toHaveLength(1);
    expect((posted[0] as File).name).toBe('stock.xlsx');
  });

  test('accepts an .xlsx with an empty MIME and shows every selected name', () => {
    render(<Page />);
    selectFiles(fileInput(), [xlsx('one.xlsx', ''), xlsx('two.xlsx', XLSX_MIME)]);

    expect(screen.getByText('one.xlsx, two.xlsx')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '上傳' })).toBeEnabled();
  });
});
