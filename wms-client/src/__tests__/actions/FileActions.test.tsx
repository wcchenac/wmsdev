import type { Mock, Mocked } from 'vitest';
import { createMockStore } from '../helpers/mockStore';
import * as actions from '../../actions/FileActions';
import * as types from '../../types';
import API from '../../utilities/API';
import { notifyRequestFailed } from '../../utilities/notifyRequestFailed';

// Mock dependencies
vi.mock('../../utilities/API');
vi.mock('../../utilities/notifyRequestFailed', () => ({
  notifyRequestFailed: vi.fn(),
}));

const mockedAPI = API as Mocked<typeof API>;

const mockStore = createMockStore;

interface MockLink {
  href: string;
  setAttribute: Mock;
  click: Mock;
  remove: Mock;
}

describe('FileActions', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore({});
    vi.clearAllMocks();
  });

  describe('downloadFile', () => {
    const fileCategory = 'reports';
    const filename = 'test-report.xlsx';
    let mockLink: MockLink;

    beforeEach(() => {
      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
      global.URL.revokeObjectURL = vi.fn();

      // Mock document methods
      mockLink = {
        href: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
        remove: vi.fn()
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('calls API.get with correct endpoint and blob response type', async () => {
      const mockResponse = {
        data: new Blob(['test content']),
        headers: {
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'content-disposition': 'attachment; filename=test-report.xlsx'
        }
      };
      mockedAPI.get.mockResolvedValue(mockResponse);

      await actions.downloadFile(fileCategory, filename);

      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockedAPI.get).toHaveBeenCalledWith(
        `api/file/download/${fileCategory}/${filename}`,
        { responseType: 'blob' }
      );
    });

    test('creates download link with correct filename', async () => {
      const mockResponse = {
        data: new Blob(['test content']),
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename=downloaded-file.pdf'
        }
      };
      mockedAPI.get.mockResolvedValue(mockResponse);

      await actions.downloadFile(fileCategory, filename);

      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'downloaded-file.pdf');
    });

    test('triggers download by clicking link', async () => {
      const mockResponse = {
        data: new Blob(['test content']),
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename=file.pdf'
        }
      };
      mockedAPI.get.mockResolvedValue(mockResponse);

      await actions.downloadFile(fileCategory, filename);

      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
    });

    test('revokes the object URL after the download', async () => {
      const mockResponse = {
        data: new Blob(['test content']),
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename=file.pdf'
        }
      };
      mockedAPI.get.mockResolvedValue(mockResponse);

      actions.downloadFile(fileCategory, filename);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    test('reports a failed download through notifyRequestFailed', async () => {
      const error = { response: { status: 500, data: { message: 'nope' } } };
      mockedAPI.get.mockRejectedValue(error);

      actions.downloadFile(fileCategory, filename);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(notifyRequestFailed).toHaveBeenCalledWith(error);
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });

    test('forwards a 401 to notifyRequestFailed so API.ts still owns the session toast', async () => {
      const error = { response: { status: 401, data: { message: 'Unauthorized' } } };
      mockedAPI.get.mockRejectedValue(error);

      actions.downloadFile(fileCategory, filename);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(notifyRequestFailed).toHaveBeenCalledWith(error);
    });

    test('parses quoted filename, RFC 5987 filename*, and fallback filename', async () => {
      mockedAPI.get.mockResolvedValueOnce({
        data: new Blob(['test']),
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="report (1).pdf"; size=42'
        }
      });
      await actions.downloadFile(fileCategory, filename);
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'report (1).pdf');

      mockedAPI.get.mockResolvedValueOnce({
        data: new Blob(['test']),
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': "attachment; filename*=UTF-8''%E5%87%BA%E5%BA%AB%E5%96%AE.xlsx"
        }
      });
      await actions.downloadFile(fileCategory, filename);
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', '出庫單.xlsx');

      mockedAPI.get.mockResolvedValueOnce({
        data: new Blob(['test']),
        headers: { 'content-type': 'application/pdf' }
      });
      await actions.downloadFile(fileCategory, filename);
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', filename);
    });

    test('unwraps JSON Blob error response before calling notifyRequestFailed', async () => {
      const jsonBlob = new Blob([JSON.stringify({ message: '找不到檔案' })], {
        type: 'application/json'
      });
      mockedAPI.get.mockRejectedValue({
        response: { status: 400, data: jsonBlob }
      });

      await actions.downloadFile(fileCategory, filename);

      expect(notifyRequestFailed).toHaveBeenCalledWith({
        response: { status: 400, data: { message: '找不到檔案' } }
      });
    });
  });

  describe('queryFileCategoryTodayFile', () => {
    const fileCategory = 'instock';

    test('calls API.get with correct endpoint', async () => {
      const mockFiles = [{ filename: 'today-file.xlsx', date: '2024-01-15' }];
      mockedAPI.get.mockResolvedValue({ data: mockFiles });

      await actions.queryFileCategoryTodayFile(fileCategory);

      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/file/query/${fileCategory}/today`);
    });

    test('returns API response', async () => {
      const mockResponse = { data: [{ filename: 'today-file.xlsx' }] };
      mockedAPI.get.mockResolvedValue(mockResponse);

      const result = await actions.queryFileCategoryTodayFile(fileCategory);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('queryFileCategoryIntervalFiles', () => {
    const fileCategory = 'outstock';
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';

    test('calls API.get with correct endpoint and date params', async () => {
      const mockFiles = [
        { filename: 'file1.xlsx', date: '2024-01-10' },
        { filename: 'file2.xlsx', date: '2024-01-20' }
      ];
      mockedAPI.get.mockResolvedValue({ data: mockFiles });

      await actions.queryFileCategoryIntervalFiles(fileCategory, startDate, endDate);

      expect(mockedAPI.get).toHaveBeenCalledWith(
        `/api/file/query/${fileCategory}/interval?startDate=${startDate}&endDate=${endDate}`
      );
    });

    test('returns API response', async () => {
      const mockResponse = { data: [{ filename: 'file1.xlsx' }] };
      mockedAPI.get.mockResolvedValue(mockResponse);

      const result = await actions.queryFileCategoryIntervalFiles(fileCategory, startDate, endDate);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('inStockByImportFile', () => {
    const mockFiles = new FormData();
    mockFiles.append('file', new Blob(['test']), 'import.xlsx');

    test('calls API.post with correct endpoint and files', async () => {
      mockedAPI.post.mockResolvedValue({ data: { imported: 10 } });

      await actions.inStockByImportFile(mockFiles);

      expect(mockedAPI.post).toHaveBeenCalledWith('api/file/import/inStockFile', mockFiles);
    });

    test('returns API response', async () => {
      const mockResponse = { data: { imported: 10, errors: [] } };
      mockedAPI.post.mockResolvedValue(mockResponse);

      const result = await actions.inStockByImportFile(mockFiles);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('setWHByImportFile', () => {
    const mockFiles = new FormData();
    mockFiles.append('file', new Blob(['test']), 'warehouse.xlsx');

    test('calls API.post with correct endpoint and files', async () => {
      mockedAPI.post.mockResolvedValue({ data: { updated: 5 } });

      await actions.setWHByImportFile(mockFiles);

      expect(mockedAPI.post).toHaveBeenCalledWith('api/file/import/setWHFile', mockFiles);
    });

    test('returns API response', async () => {
      const mockResponse = { data: { updated: 5, errors: [] } };
      mockedAPI.post.mockResolvedValue(mockResponse);

      const result = await actions.setWHByImportFile(mockFiles);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('queryCategoryDetailList', () => {
    const mockCategoryList = [
      { category: 'fabric', count: 100 },
      { category: 'hardware', count: 50 }
    ];

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockCategoryList });

      await store.dispatch(actions.queryCategoryDetailList());

      expect(mockedAPI.get).toHaveBeenCalledWith('api/file/query/categoryList');
    });

    test('dispatches GET_Categories with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockCategoryList });

      await store.dispatch(actions.queryCategoryDetailList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Categories,
        payload: mockCategoryList
      });
    });

    test('returns response object', async () => {
      const response = { data: mockCategoryList, status: 200 };
      mockedAPI.get.mockResolvedValue(response);

      const result = await store.dispatch(actions.queryCategoryDetailList());

      expect(result).toEqual(response);
    });
  });

  // ============================================
  // Edge Cases and Error Handling
  // ============================================

  describe('edge cases', () => {
    test('queryFileCategoryTodayFile handles empty response', async () => {
      mockedAPI.get.mockResolvedValue({ data: [] });

      const result = await actions.queryFileCategoryTodayFile('reports');

      expect(result.data).toEqual([]);
    });

    test('queryFileCategoryIntervalFiles handles date edge cases', async () => {
      mockedAPI.get.mockResolvedValue({ data: [] });

      // Same start and end date
      await actions.queryFileCategoryIntervalFiles('reports', '2024-01-15', '2024-01-15');

      expect(mockedAPI.get).toHaveBeenCalledWith(
        '/api/file/query/reports/interval?startDate=2024-01-15&endDate=2024-01-15'
      );
    });

    test('inStockByImportFile handles empty FormData', async () => {
      const emptyFormData = new FormData();
      mockedAPI.post.mockResolvedValue({ data: { imported: 0 } });

      const result = await actions.inStockByImportFile(emptyFormData);

      expect(result.data.imported).toBe(0);
    });

    test('queryCategoryDetailList handles API error', async () => {
      const errorResponse = { data: { message: 'Server error' } };
      mockedAPI.get.mockRejectedValue({ response: errorResponse });

      await expect(store.dispatch(actions.queryCategoryDetailList())).rejects.toEqual({
        response: errorResponse
      });
    });

    test('encodes special characters in file category and filename URLs (C-3)', async () => {
      mockedAPI.get.mockResolvedValue({
        data: new Blob(['x']),
        headers: { 'content-type': 'application/octet-stream' },
      });

      await actions.queryFileCategoryIntervalFiles('cat/1', '2026-01-01T00:00:00', '2026-01-02T23:59:59');
      expect(mockedAPI.get).toHaveBeenCalledWith(
        '/api/file/query/cat%2F1/interval?startDate=2026-01-01T00%3A00%3A00&endDate=2026-01-02T23%3A59%3A59'
      );

      await actions.downloadFile('cat/1', 'a#b 1.xlsx');
      expect(mockedAPI.get).toHaveBeenCalledWith(
        'api/file/download/cat%2F1/a%23b%201.xlsx',
        { responseType: 'blob' }
      );
    });
  });
});
