import type { Mock, Mocked } from 'vitest';
import configureMockStore from 'redux-mock-store';
import { thunk, ThunkDispatch } from 'redux-thunk';
import * as actions from '../../actions/FileActions';
import * as types from '../../types';
import API from '../../utilities/API';
import { AnyAction } from 'redux';

// Mock dependencies
vi.mock('../../utilities/API');

const mockedAPI = API as Mocked<typeof API>;

type RootState = Record<string, unknown>;
type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

const mockStore = configureMockStore<RootState, AppDispatch>([thunk]);

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

    test('dispatches GET_StockInfoes with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockCategoryList });

      await store.dispatch(actions.queryCategoryDetailList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_StockInfoes,
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
  });
});
