import type { Mocked } from 'vitest';
import configureMockStore from 'redux-mock-store';
import { thunk, ThunkDispatch } from 'redux-thunk';
import * as actions from '../../actions/StockActions';
import * as types from '../../types';
import API from '../../utilities/API';
import { AnyAction } from 'redux';

// Mock dependencies
vi.mock('../../utilities/API');

const mockedAPI = API as Mocked<typeof API>;

type RootState = Record<string, unknown>;
type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

const mockStore = configureMockStore<RootState, AppDispatch>([thunk]);

describe('StockActions', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore({});
    vi.clearAllMocks();
  });

  // ============================================
  // Order Query Actions
  // ============================================

  describe('getInStockOrder', () => {
    const orderNo = 'IN001';
    const mockOrderData = {
      orderNo: 'IN001',
      items: [{ productNo: 'P001', quantity: '10' }]
    };

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockOrderData });

      await store.dispatch(actions.getInStockOrder(orderNo));

      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryOrder/inStock/${orderNo}`);
    });

    test('dispatches GET_Order with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockOrderData });

      await store.dispatch(actions.getInStockOrder(orderNo));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Order,
        payload: mockOrderData
      });
    });

    test('returns response object', async () => {
      const response = { data: mockOrderData };
      mockedAPI.get.mockResolvedValue(response);

      const result = await store.dispatch(actions.getInStockOrder(orderNo));

      expect(result).toEqual(response);
    });
  });

  describe('getAssembleOrder', () => {
    const orderNo = 'ASM001';
    const mockOrderData = {
      orderNo: 'ASM001',
      items: [{ productNo: 'P002', quantity: '5' }]
    };

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockOrderData });

      await store.dispatch(actions.getAssembleOrder(orderNo));

      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryOrder/assemble/${orderNo}`);
    });

    test('dispatches GET_Order with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockOrderData });

      await store.dispatch(actions.getAssembleOrder(orderNo));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Order,
        payload: mockOrderData
      });
    });
  });

  describe('getCustomerReturnOrder', () => {
    const orderNo = 'CR001';
    const mockOrderData = { orderNo: 'CR001', reason: '品質問題' };

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockOrderData });

      await store.dispatch(actions.getCustomerReturnOrder(orderNo));

      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryOrder/customerReturn/${orderNo}`);
    });

    test('dispatches GET_Order with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockOrderData });

      await store.dispatch(actions.getCustomerReturnOrder(orderNo));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Order,
        payload: mockOrderData
      });
    });
  });

  describe('getStoreReturnOrder', () => {
    const orderNo = 'SR001';
    const mockOrderData = { orderNo: 'SR001', store: '中壢' };

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockOrderData });

      await store.dispatch(actions.getStoreReturnOrder(orderNo));

      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryOrder/storeReturn/${orderNo}`);
    });

    test('dispatches GET_Order with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockOrderData });

      await store.dispatch(actions.getStoreReturnOrder(orderNo));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Order,
        payload: mockOrderData
      });
    });
  });

  describe('getOutStockToStoreOrder', () => {
    const orderNo = 'OUT001';
    const mockOrderData = { orderNo: 'OUT001', destination: '新竹' };

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockOrderData });

      await store.dispatch(actions.getOutStockToStoreOrder(orderNo));

      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryOrder/outStockToStore/${orderNo}`);
    });

    test('dispatches GET_Order with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockOrderData });

      await store.dispatch(actions.getOutStockToStoreOrder(orderNo));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Order,
        payload: mockOrderData
      });
    });
  });

  // ============================================
  // Stock Query Actions
  // ============================================

  describe('getStockInfoesBasic', () => {
    const productNo = 'PROD001';
    const mockStockData = [{ id: 1, productNo: 'PROD001', quantity: '100' }];

    test('calls API.get with level 2 endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockStockData });

      await store.dispatch(actions.getStockInfoesBasic(productNo));

      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryStock/query/2/${productNo}`);
    });

    test('dispatches GET_StockInfoes with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockStockData });

      await store.dispatch(actions.getStockInfoesBasic(productNo));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_StockInfoes,
        payload: mockStockData
      });
    });
  });

  describe('getStockInfoes', () => {
    const productNo = 'PROD001';
    const mockStockData = [{ id: 1, productNo: 'PROD001', quantity: '100', details: {} }];

    test('calls API.get with level 1 endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockStockData });

      await store.dispatch(actions.getStockInfoes(productNo));

      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryStock/query/1/${productNo}`);
    });

    test('dispatches GET_StockInfoes with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockStockData });

      await store.dispatch(actions.getStockInfoes(productNo));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_StockInfoes,
        payload: mockStockData
      });
    });
  });

  describe('getShrinkList', () => {
    const mockShrinkList = [{ id: 1, waitToShrink: true }];

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockShrinkList });

      await store.dispatch(actions.getShrinkList());

      expect(mockedAPI.get).toHaveBeenCalledWith('/api/stock/queryStock/shrinkList');
    });

    test('dispatches GET_StockInfoes with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockShrinkList });

      await store.dispatch(actions.getShrinkList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_StockInfoes,
        payload: mockShrinkList
      });
    });
  });

  // ============================================
  // Ship Stock Actions
  // ============================================

  describe('stockIdentifierIsShiped', () => {
    const shipRequest = {
      stockIdentifierId: 123,
      destination: '中壢'
    };

    test('dispatches SHIP_Stock immediately', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });

      await store.dispatch(actions.stockIdentifierIsShiped(shipRequest));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.SHIP_Stock,
        payload: shipRequest.stockIdentifierId
      });
    });

    test('calls API.patch with correct endpoint and data', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });

      await store.dispatch(actions.stockIdentifierIsShiped(shipRequest));

      expect(mockedAPI.patch).toHaveBeenCalledWith('/api/stock/shipStock', shipRequest);
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Ship failed' };
      mockedAPI.patch.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.stockIdentifierIsShiped(shipRequest));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[1]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  describe('stockIdentifiersAreShiped', () => {
    const productNo = 'PROD001';
    const shipRequests = [
      { stockIdentifierId: 1, destination: '中壢' },
      { stockIdentifierId: 2, destination: '新竹' }
    ];
    const mockStockData = [{ id: 1, isShipped: true }];

    test('calls API.patch then API.get', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });
      mockedAPI.get.mockResolvedValue({ data: mockStockData });

      await store.dispatch(actions.stockIdentifiersAreShiped(productNo, shipRequests));

      expect(mockedAPI.patch).toHaveBeenCalledWith('/api/stock/shipStocks', shipRequests);
      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryStock/query/1/${productNo}`);
    });

    test('dispatches SHIP_Stocks with refreshed data', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });
      mockedAPI.get.mockResolvedValue({ data: mockStockData });

      await store.dispatch(actions.stockIdentifiersAreShiped(productNo, shipRequests));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.SHIP_Stocks,
        payload: mockStockData
      });
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Batch ship failed' };
      mockedAPI.patch.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.stockIdentifiersAreShiped(productNo, shipRequests));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  describe('stockIdentifierIsNotShiped', () => {
    const stockIdentifierId = 123;

    test('calls API.patch with rollback endpoint', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });

      await store.dispatch(actions.stockIdentifierIsNotShiped(stockIdentifierId));

      expect(mockedAPI.patch).toHaveBeenCalledWith(`/api/stock/shipStock/rollback/${stockIdentifierId}`);
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Rollback failed' };
      mockedAPI.patch.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.stockIdentifierIsNotShiped(stockIdentifierId));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  // ============================================
  // Shrink Stock Actions
  // ============================================

  describe('stockIdentifierWaitToShrinkIsTrue', () => {
    const stockIdentifierId = 123;
    const productNo = 'PROD001';
    const mockStockData = [{ id: 1, waitToShrink: true }];

    test('calls API.patch then API.get', async () => {
      mockedAPI.patch.mockResolvedValue({ data: productNo });
      mockedAPI.get.mockResolvedValue({ data: mockStockData });

      await store.dispatch(actions.stockIdentifierWaitToShrinkIsTrue(stockIdentifierId));

      expect(mockedAPI.patch).toHaveBeenCalledWith(`/api/stock/waitToShrink/${stockIdentifierId}`);
      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryStock/query/1/${productNo}`);
    });

    test('dispatches SHRINK_Stock with refreshed data', async () => {
      mockedAPI.patch.mockResolvedValue({ data: productNo });
      mockedAPI.get.mockResolvedValue({ data: mockStockData });

      await store.dispatch(actions.stockIdentifierWaitToShrinkIsTrue(stockIdentifierId));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.SHRINK_Stock,
        payload: mockStockData
      });
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Shrink mark failed' };
      mockedAPI.patch.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.stockIdentifierWaitToShrinkIsTrue(stockIdentifierId));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  describe('stockIdentifierWaitToShrinkIsFalse', () => {
    const stockIdentifierId = 123;

    test('calls API.patch with rollback endpoint', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });

      await store.dispatch(actions.stockIdentifierWaitToShrinkIsFalse(stockIdentifierId));

      expect(mockedAPI.patch).toHaveBeenCalledWith(`/api/stock/waitToShrink/rollback/${stockIdentifierId}`);
    });

    test('dispatches CANCEL_SHRINK with stockIdentifierId', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });

      await store.dispatch(actions.stockIdentifierWaitToShrinkIsFalse(stockIdentifierId));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.CANCEL_SHRINK,
        payload: stockIdentifierId
      });
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Cancel shrink failed' };
      mockedAPI.patch.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.stockIdentifierWaitToShrinkIsFalse(stockIdentifierId));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  // ============================================
  // Create Stock Actions
  // ============================================

  describe('batchCreateStockInfoes', () => {
    const inStockRequests = [
      { productNo: 'P001', quantity: '10' },
      { productNo: 'P002', quantity: '20' }
    ];

    test('calls API.post with correct endpoint and data', async () => {
      mockedAPI.post.mockResolvedValue({ data: { success: true } });

      await store.dispatch(actions.batchCreateStockInfoes(inStockRequests));

      expect(mockedAPI.post).toHaveBeenCalledWith('/api/stock/inStocks', inStockRequests);
    });

    test('returns response on success', async () => {
      const response = { data: { success: true } };
      mockedAPI.post.mockResolvedValue(response);

      const result = await store.dispatch(actions.batchCreateStockInfoes(inStockRequests));

      expect(result).toEqual(response);
    });

    test('dispatches CREATE_Errors on failure', async () => {
      const errorData = { message: 'Create failed' };
      mockedAPI.post.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.batchCreateStockInfoes(inStockRequests));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.CREATE_Errors,
        payload: errorData
      });
    });
  });

  describe('batchCreateStockInfoesForShrink', () => {
    const shrinkRequest = {
      sourceId: 123,
      newItems: [{ quantity: '5', type: 'RR' }]
    };

    test('calls API.post with correct endpoint and data', async () => {
      mockedAPI.post.mockResolvedValue({ data: { success: true } });

      await store.dispatch(actions.batchCreateStockInfoesForShrink(shrinkRequest));

      expect(mockedAPI.post).toHaveBeenCalledWith('/api/stock/shrinkStock', shrinkRequest);
    });

    test('dispatches SHRINK_Errors on failure', async () => {
      const errorData = { message: 'Shrink create failed' };
      mockedAPI.post.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.batchCreateStockInfoesForShrink(shrinkRequest));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.SHRINK_Errors,
        payload: errorData
      });
    });
  });

  // ============================================
  // Rollback Actions
  // ============================================

  describe('getInStockRollbackList', () => {
    const orderType = 'normal';
    const orderNo = 'IN001';
    const mockRollbackList = [{ id: 1, canRollback: true }];

    test('calls API.get with correct query params', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockRollbackList });

      await store.dispatch(actions.getInStockRollbackList(orderType, orderNo));

      expect(mockedAPI.get).toHaveBeenCalledWith(
        `/api/stock/queryStock/inStockRollback?orderType=${orderType}&orderNo=${orderNo}`
      );
    });

    test('dispatches GET_StockInfoes with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockRollbackList });

      await store.dispatch(actions.getInStockRollbackList(orderType, orderNo));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_StockInfoes,
        payload: mockRollbackList
      });
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Query failed' };
      mockedAPI.get.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.getInStockRollbackList(orderType, orderNo));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  describe('inStockRollback', () => {
    const idList = [1, 2, 3];
    const orderType = 'normal';
    const orderNo = 'IN001';
    const mockRollbackList = [{ id: 4, canRollback: true }];

    test('calls API.patch then API.get', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });
      mockedAPI.get.mockResolvedValue({ data: mockRollbackList });

      await store.dispatch(actions.inStockRollback(idList, orderType, orderNo));

      expect(mockedAPI.patch).toHaveBeenCalledWith('/api/stock/inStocks/rollback', idList);
      expect(mockedAPI.get).toHaveBeenCalledWith(
        `/api/stock/queryStock/inStockRollback?orderType=${orderType}&orderNo=${orderNo}`
      );
    });

    test('dispatches GET_StockInfoes with refreshed data', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });
      mockedAPI.get.mockResolvedValue({ data: mockRollbackList });

      await store.dispatch(actions.inStockRollback(idList, orderType, orderNo));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_StockInfoes,
        payload: mockRollbackList
      });
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Rollback failed' };
      mockedAPI.patch.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.inStockRollback(idList, orderType, orderNo));
      } catch (err) {
        // expected error
      }

      // The list is queried again after a failed rollback too (see RollbackActions.test).
      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toContainEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  describe('getShrinkRollbackList', () => {
    const productNo = 'PROD001';
    const mockRollbackList = [{ id: 1, shrinkable: true }];

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockRollbackList });

      await store.dispatch(actions.getShrinkRollbackList(productNo));

      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryStock/shrinkRollback/${productNo}`);
    });

    test('dispatches GET_StockInfoes with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockRollbackList });

      await store.dispatch(actions.getShrinkRollbackList(productNo));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_StockInfoes,
        payload: mockRollbackList
      });
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Query failed' };
      mockedAPI.get.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.getShrinkRollbackList(productNo));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  describe('shrinkRollback', () => {
    const stockIdentifierId = 123;
    const productNo = 'PROD001';
    const mockRollbackList = [{ id: 2, shrinkable: true }];

    test('calls API.patch then API.get', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });
      mockedAPI.get.mockResolvedValue({ data: mockRollbackList });

      await store.dispatch(actions.shrinkRollback(stockIdentifierId, productNo));

      expect(mockedAPI.patch).toHaveBeenCalledWith(`/api/stock/shrinkStock/rollback/${stockIdentifierId}`);
      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryStock/shrinkRollback/${productNo}`);
    });

    test('dispatches GET_StockInfoes with refreshed data', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });
      mockedAPI.get.mockResolvedValue({ data: mockRollbackList });

      await store.dispatch(actions.shrinkRollback(stockIdentifierId, productNo));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_StockInfoes,
        payload: mockRollbackList
      });
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Shrink rollback failed' };
      mockedAPI.patch.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.shrinkRollback(stockIdentifierId, productNo));
      } catch (err) {
        // expected error
      }

      // The list is queried again after a failed rollback too (see RollbackActions.test).
      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toContainEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  // ============================================
  // Update Stock Actions
  // ============================================

  describe('updateStockInfo', () => {
    const updateRequest = {
      stockIdentifierId: 123,
      quantity: '50',
      unit: 'yards'
    };
    const productNo = 'PROD001';
    const mockStockData = [{ id: 123, quantity: '50' }];

    test('calls API.patch then API.get', async () => {
      mockedAPI.patch.mockResolvedValue({ data: productNo });
      mockedAPI.get.mockResolvedValue({ data: mockStockData });

      await store.dispatch(actions.updateStockInfo(updateRequest));

      expect(mockedAPI.patch).toHaveBeenCalledWith('/api/stock/updateStock', updateRequest);
      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryStock/query/1/${productNo}`);
    });

    test('dispatches UPDATE_StockInfo with refreshed data', async () => {
      mockedAPI.patch.mockResolvedValue({ data: productNo });
      mockedAPI.get.mockResolvedValue({ data: mockStockData });

      await store.dispatch(actions.updateStockInfo(updateRequest));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.UPDATE_StockInfo,
        payload: mockStockData
      });
    });

    test('dispatches UPDATE_Errors on failure', async () => {
      const errorData = { message: 'Update failed' };
      mockedAPI.patch.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.updateStockInfo(updateRequest));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.UPDATE_Errors,
        payload: errorData
      });
    });
  });

  // ============================================
  // Out Stock Request Actions
  // ============================================

  describe('createOutStockRequest', () => {
    const outStockRequest = {
      productNo: 'PROD001',
      quantity: '10',
      reason: '中壢'
    };

    test('calls API.post with correct endpoint and data', async () => {
      mockedAPI.post.mockResolvedValue({ data: { id: 1 } });

      await store.dispatch(actions.createOutStockRequest(outStockRequest));

      expect(mockedAPI.post).toHaveBeenCalledWith('/api/stock/outStock', outStockRequest);
    });

    test('returns response on success', async () => {
      const response = { data: { id: 1 } };
      mockedAPI.post.mockResolvedValue(response);

      const result = await store.dispatch(actions.createOutStockRequest(outStockRequest));

      expect(result).toEqual(response);
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Create request failed' };
      mockedAPI.post.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.createOutStockRequest(outStockRequest));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  describe('deleteOutStockRequest', () => {
    const outStockRequestId = 123;

    test('calls API.patch with rollback endpoint', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });

      await store.dispatch(actions.deleteOutStockRequest(outStockRequestId));

      expect(mockedAPI.patch).toHaveBeenCalledWith(`/api/stock/outStock/rollback/${outStockRequestId}`);
    });

    test('returns response on success', async () => {
      const response = { data: { success: true } };
      mockedAPI.patch.mockResolvedValue(response);

      const result = await store.dispatch(actions.deleteOutStockRequest(outStockRequestId));

      expect(result).toEqual(response);
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Delete request failed' };
      mockedAPI.patch.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.deleteOutStockRequest(outStockRequestId));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  describe('getWaitHandleList', () => {
    const mockWaitList = {
      queryResult: { 'PROD001': [{ id: 1 }] },
      userList: ['user1']
    };

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockWaitList });

      await store.dispatch(actions.getWaitHandleList());

      expect(mockedAPI.get).toHaveBeenCalledWith('/api/stock/outStock/waitHandleList/basic');
    });

    test('dispatches GET_OutStockRequests with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockWaitList });

      await store.dispatch(actions.getWaitHandleList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_OutStockRequests,
        payload: mockWaitList
      });
    });
  });

  describe('getWaitHandleListWithInterval', () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';
    const mockWaitList = {
      queryResult: { 'PROD001': [{ id: 1 }] },
      userList: ['user1']
    };

    test('calls API.get with date params', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockWaitList });

      await store.dispatch(actions.getWaitHandleListWithInterval(startDate, endDate));

      expect(mockedAPI.get).toHaveBeenCalledWith(
        `/api/stock/outStock/waitHandleList/interval?startDate=${startDate}&endDate=${endDate}`
      );
    });

    test('dispatches GET_OutStockRequests with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockWaitList });

      await store.dispatch(actions.getWaitHandleListWithInterval(startDate, endDate));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_OutStockRequests,
        payload: mockWaitList
      });
    });
  });

  describe('updateOutStockRequests', () => {
    const updateRequest = {
      id: 123,
      handler: 'user1'
    };

    test('calls API.patch with correct endpoint and data', async () => {
      mockedAPI.patch.mockResolvedValue({ data: { success: true } });

      await store.dispatch(actions.updateOutStockRequests(updateRequest));

      expect(mockedAPI.patch).toHaveBeenCalledWith('/api/stock/outStock/update', updateRequest);
    });

    test('returns response on success', async () => {
      const response = { data: { success: true } };
      mockedAPI.patch.mockResolvedValue(response);

      const result = await store.dispatch(actions.updateOutStockRequests(updateRequest));

      expect(result).toEqual(response);
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Update request failed' };
      mockedAPI.patch.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.updateOutStockRequests(updateRequest));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  // ============================================
  // History Actions
  // ============================================

  describe('getProductHistory', () => {
    const request = {
      productNo: 'PROD001',
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    };
    const mockHistory = [{ id: 1, action: 'IN', date: '2024-01-15' }];

    test('calls API.get with correct query params', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockHistory });

      await store.dispatch(actions.getProductHistory(request));

      expect(mockedAPI.get).toHaveBeenCalledWith(
        `/api/stock/queryStock/history/${request.productNo}?startDate=${request.startDate}&endDate=${request.endDate}`
      );
    });

    test('dispatches GET_StockInfoes with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockHistory });

      await store.dispatch(actions.getProductHistory(request));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_StockInfoes,
        payload: mockHistory
      });
    });
  });

  // ============================================
  // Mission Trigger (non-thunk)
  // ============================================

  describe('missionTrigger', () => {
    const periodType = 'daily';
    const fn = 'cleanup';

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: { success: true } });

      await actions.missionTrigger(periodType, fn);

      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/stockManagement/${periodType}/${fn}`);
    });

    test('returns API response', async () => {
      const response = { data: { success: true } };
      mockedAPI.get.mockResolvedValue(response);

      const result = await actions.missionTrigger(periodType, fn);

      expect(result).toEqual(response);
    });
  });

  // ============================================
  // Category Actions
  // ============================================

  describe('getAllCategory', () => {
    const mockCategories = ['category1', 'category2'];

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockCategories });

      await store.dispatch(actions.getAllCategory());

      expect(mockedAPI.get).toHaveBeenCalledWith('/api/stock/queryStock/categoryList');
    });

    test('dispatches GET_StockInfoes with response data', async () => {
      mockedAPI.get.mockResolvedValue({ data: mockCategories });

      await store.dispatch(actions.getAllCategory());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_StockInfoes,
        payload: mockCategories
      });
    });
  });

  describe('findCategoryDetails', () => {
    const category = 'fabric';

    test('dispatches CREATE_FILE first', async () => {
      mockedAPI.get.mockResolvedValue({ data: [] });

      await store.dispatch(actions.findCategoryDetails(category));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.CREATE_FILE
      });
    });

    test('calls API.get with correct endpoint', async () => {
      mockedAPI.get.mockResolvedValue({ data: [] });

      await store.dispatch(actions.findCategoryDetails(category));

      expect(mockedAPI.get).toHaveBeenCalledWith(`/api/stock/queryStock/category/${category}`);
    });

    test('returns API response', async () => {
      const response = { data: [{ id: 1, name: 'item1' }] };
      mockedAPI.get.mockResolvedValue(response);

      const result = await store.dispatch(actions.findCategoryDetails(category));

      expect(result).toEqual(response);
    });
  });
});
