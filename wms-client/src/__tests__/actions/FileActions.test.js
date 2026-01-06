import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../../actions/FileActions';
import * as types from '../../actions/types';
import API from '../../utilities/API';

// Mock dependencies
jest.mock('../../utilities/API');

const mockStore = configureMockStore([thunk]);

describe('FileActions', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  describe('downloadFile', () => {
    const fileCategory = 'reports';
    const filename = 'test-report.xlsx';

    beforeEach(() => {
      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
      global.URL.revokeObjectURL = jest.fn();

      // Mock document methods
      const mockLink = {
        href: '',
        setAttribute: jest.fn(),
        click: jest.fn(),
        remove: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('calls API.get with correct endpoint and blob response type', async () => {
      const mockResponse = {
        data: new Blob(['test content']),
        headers: {
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'content-disposition': 'attachment; filename=test-report.xlsx'
        }
      };
      API.get.mockResolvedValue(mockResponse);

      await actions.downloadFile(fileCategory, filename);

      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(API.get).toHaveBeenCalledWith(
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
      API.get.mockResolvedValue(mockResponse);

      await actions.downloadFile(fileCategory, filename);

      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      const mockLink = document.createElement('a');
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
      API.get.mockResolvedValue(mockResponse);

      await actions.downloadFile(fileCategory, filename);

      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      const mockLink = document.createElement('a');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
    });
  });

  describe('queryFileCategoryTodayFile', () => {
    const fileCategory = 'instock';

    test('calls API.get with correct endpoint', async () => {
      const mockFiles = [{ filename: 'today-file.xlsx', date: '2024-01-15' }];
      API.get.mockResolvedValue({ data: mockFiles });

      await actions.queryFileCategoryTodayFile(fileCategory);

      expect(API.get).toHaveBeenCalledWith(`/api/file/query/${fileCategory}/today`);
    });

    test('returns API response', async () => {
      const mockResponse = { data: [{ filename: 'today-file.xlsx' }] };
      API.get.mockResolvedValue(mockResponse);

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
      API.get.mockResolvedValue({ data: mockFiles });

      await actions.queryFileCategoryIntervalFiles(fileCategory, startDate, endDate);

      expect(API.get).toHaveBeenCalledWith(
        `/api/file/query/${fileCategory}/interval?startDate=${startDate}&endDate=${endDate}`
      );
    });

    test('returns API response', async () => {
      const mockResponse = { data: [{ filename: 'file1.xlsx' }] };
      API.get.mockResolvedValue(mockResponse);

      const result = await actions.queryFileCategoryIntervalFiles(fileCategory, startDate, endDate);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('inStockByImportFile', () => {
    const mockFiles = new FormData();
    mockFiles.append('file', new Blob(['test']), 'import.xlsx');

    test('calls API.post with correct endpoint and files', async () => {
      API.post.mockResolvedValue({ data: { imported: 10 } });

      await actions.inStockByImportFile(mockFiles);

      expect(API.post).toHaveBeenCalledWith('api/file/import/inStockFile', mockFiles);
    });

    test('returns API response', async () => {
      const mockResponse = { data: { imported: 10, errors: [] } };
      API.post.mockResolvedValue(mockResponse);

      const result = await actions.inStockByImportFile(mockFiles);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('setWHByImportFile', () => {
    const mockFiles = new FormData();
    mockFiles.append('file', new Blob(['test']), 'warehouse.xlsx');

    test('calls API.post with correct endpoint and files', async () => {
      API.post.mockResolvedValue({ data: { updated: 5 } });

      await actions.setWHByImportFile(mockFiles);

      expect(API.post).toHaveBeenCalledWith('api/file/import/setWHFile', mockFiles);
    });

    test('returns API response', async () => {
      const mockResponse = { data: { updated: 5, errors: [] } };
      API.post.mockResolvedValue(mockResponse);

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
      API.get.mockResolvedValue({ data: mockCategoryList });

      await store.dispatch(actions.queryCategoryDetailList());

      expect(API.get).toHaveBeenCalledWith('api/file/query/categoryList');
    });

    test('dispatches GET_StockInfoes with response data', async () => {
      API.get.mockResolvedValue({ data: mockCategoryList });

      await store.dispatch(actions.queryCategoryDetailList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_StockInfoes,
        payload: mockCategoryList
      });
    });

    test('returns response object', async () => {
      const response = { data: mockCategoryList, status: 200 };
      API.get.mockResolvedValue(response);

      const result = await store.dispatch(actions.queryCategoryDetailList());

      expect(result).toEqual(response);
    });
  });

  // ============================================
  // Edge Cases and Error Handling
  // ============================================

  describe('edge cases', () => {
    test('queryFileCategoryTodayFile handles empty response', async () => {
      API.get.mockResolvedValue({ data: [] });

      const result = await actions.queryFileCategoryTodayFile('reports');

      expect(result.data).toEqual([]);
    });

    test('queryFileCategoryIntervalFiles handles date edge cases', async () => {
      API.get.mockResolvedValue({ data: [] });

      // Same start and end date
      await actions.queryFileCategoryIntervalFiles('reports', '2024-01-15', '2024-01-15');

      expect(API.get).toHaveBeenCalledWith(
        '/api/file/query/reports/interval?startDate=2024-01-15&endDate=2024-01-15'
      );
    });

    test('inStockByImportFile handles empty FormData', async () => {
      const emptyFormData = new FormData();
      API.post.mockResolvedValue({ data: { imported: 0 } });

      const result = await actions.inStockByImportFile(emptyFormData);

      expect(result.data.imported).toBe(0);
    });

    test('queryCategoryDetailList handles API error', async () => {
      const errorResponse = { data: { message: 'Server error' } };
      API.get.mockRejectedValue({ response: errorResponse });

      await expect(store.dispatch(actions.queryCategoryDetailList())).rejects.toEqual({
        response: errorResponse
      });
    });
  });
});
