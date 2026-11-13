import { AxiosResponse } from "axios";
import API from "../utilities/API";
import {
  GET_Order,
  GET_StockInfoes,
  GET_Errors,
  CREATE_Errors,
  SHRINK_Errors,
  SHIP_Stock,
  SHIP_Stocks,
  SHRINK_Stock,
  CANCEL_SHRINK,
  GET_OutStockRequests,
  UPDATE_StockInfo,
  UPDATE_Errors,
  CREATE_FILE,
  AppDispatch,
  InStockRequest,
  ShipRequest,
  ShrinkStockRequest,
  OutStockRequestCreate,
  OutStockUpdateRequest,
  ProductHistoryRequest,
  UpdateStockInfoRequest,
} from "../types";

export const getInStockOrder =
  (inStockOrderNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get(`/api/stock/queryOrder/inStock/${inStockOrderNo}`);

      dispatch({
        type: GET_Order,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得入庫單" },
      });
      throw err;
    }
  };

export const getAssembleOrder =
  (assembleOrderNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get(
        `/api/stock/queryOrder/assemble/${assembleOrderNo}`
      );

      dispatch({
        type: GET_Order,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得組裝單" },
      });
      throw err;
    }
  };

export const getCustomerReturnOrder =
  (returnOrderNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get(
        `/api/stock/queryOrder/customerReturn/${returnOrderNo}`
      );

      dispatch({
        type: GET_Order,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得客退單" },
      });
      throw err;
    }
  };

export const getStoreReturnOrder =
  (returnOrderNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get(
        `/api/stock/queryOrder/storeReturn/${returnOrderNo}`
      );

      dispatch({
        type: GET_Order,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得門市退貨單" },
      });
      throw err;
    }
  };

export const getOutStockToStoreOrder =
  (outStockOrderNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get(
        `/api/stock/queryOrder/outStockToStore/${outStockOrderNo}`
      );

      dispatch({
        type: GET_Order,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得出貨至門市單" },
      });
      throw err;
    }
  };

export const getStockInfoesBasic =
  (productNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get(`/api/stock/queryStock/query/2/${productNo}`);

      dispatch({
        type: GET_StockInfoes,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得庫存基本資訊" },
      });
      throw err;
    }
  };

export const getStockInfoes =
  (productNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get(`/api/stock/queryStock/query/1/${productNo}`);

      dispatch({
        type: GET_StockInfoes,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得庫存詳細資訊" },
      });
      throw err;
    }
  };

export const getShrinkList =
  () =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get("/api/stock/queryStock/shrinkList");

      dispatch({
        type: GET_StockInfoes,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得縮碼列表" },
      });
      throw err;
    }
  };

export const stockIdentifierIsShiped =
  (shipRequest: ShipRequest) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      dispatch({
        type: SHIP_Stock,
        payload: shipRequest.stockIdentifierId,
      });

      return await API.patch("/api/stock/shipStock", shipRequest);
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "出貨操作失敗" },
      });
      throw err;
    }
  };

export const stockIdentifiersAreShiped =
  (productNo: string, shipRequests: ShipRequest[]) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      await API.patch("/api/stock/shipStocks", shipRequests);

      const res = await API.get(`/api/stock/queryStock/query/1/${productNo}`);

      dispatch({
        type: SHIP_Stocks,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "批次出貨操作失敗" },
      });
      throw err;
    }
  };

export const stockIdentifierIsNotShiped =
  (stockIdentifierId: number) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      return await API.patch(
        `/api/stock/shipStock/rollback/${stockIdentifierId}`
      );
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "取消出貨操作失敗" },
      });
      throw err;
    }
  };

export const stockIdentifierWaitToShrinkIsTrue =
  (stockIdentifierId: number) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const result = await API.patch(
        `/api/stock/waitToShrink/${stockIdentifierId}`
      );
      const productNo: string = result.data;
      const res = await API.get(`/api/stock/queryStock/query/1/${productNo}`);

      dispatch({
        type: SHRINK_Stock,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "設定待縮碼失敗" },
      });
      throw err;
    }
  };

export const stockIdentifierWaitToShrinkIsFalse =
  (stockIdentifierId: number) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.patch(
        `/api/stock/waitToShrink/rollback/${stockIdentifierId}`
      );

      dispatch({
        type: CANCEL_SHRINK,
        payload: stockIdentifierId,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "取消待縮碼失敗" },
      });
      throw err;
    }
  };

export const batchCreateStockInfoes =
  (inStockRequests: InStockRequest[]) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      return await API.post("/api/stock/inStocks", inStockRequests);
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: CREATE_Errors,
        payload: error.response?.data || { message: "批次入庫失敗" },
      });
      throw err;
    }
  };

export const batchCreateStockInfoesForShrink =
  (shrinkStockRequest: ShrinkStockRequest) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      return await API.post("/api/stock/shrinkStock", shrinkStockRequest);
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: SHRINK_Errors,
        payload: error.response?.data || { message: "縮碼入庫失敗" },
      });
      throw err;
    }
  };

export const getInStockRollbackList =
  (orderType: string, orderNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get(
        `/api/stock/queryStock/inStockRollback?orderType=${orderType}&orderNo=${orderNo}`
      );

      dispatch({
        type: GET_StockInfoes,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得入庫回滾列表" },
      });
      throw err;
    }
  };

export const inStockRollback =
  (idList: number[], orderType: string, orderNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      await API.patch("/api/stock/inStocks/rollback", idList);

      const res = await API.get(
        `/api/stock/queryStock/inStockRollback?orderType=${orderType}&orderNo=${orderNo}`
      );

      dispatch({
        type: GET_StockInfoes,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "入庫回滾失敗" },
      });
      throw err;
    }
  };

export const getShrinkRollbackList =
  (productNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get(
        `/api/stock/queryStock/shrinkRollback/${productNo}`
      );

      dispatch({
        type: GET_StockInfoes,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得縮碼回滾列表" },
      });
      throw err;
    }
  };

export const shrinkRollback =
  (stockIdentifierId: number, productNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      await API.patch(`/api/stock/shrinkStock/rollback/${stockIdentifierId}`);

      const res = await API.get(
        `/api/stock/queryStock/shrinkRollback/${productNo}`
      );

      dispatch({
        type: GET_StockInfoes,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "縮碼回滾失敗" },
      });
      throw err;
    }
  };

export const updateStockInfo =
  (updateInfoRequest: UpdateStockInfoRequest) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const result = await API.patch("/api/stock/updateStock", updateInfoRequest);
      const productNo: string = result.data;
      const res = await API.get(`/api/stock/queryStock/query/1/${productNo}`);

      dispatch({
        type: UPDATE_StockInfo,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: UPDATE_Errors,
        payload: error.response?.data || { message: "更新庫存資訊失敗" },
      });
      throw err;
    }
  };

export const createOutStockRequest =
  (outStockRequest: OutStockRequestCreate) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      return await API.post("/api/stock/outStock", outStockRequest);
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "建立出庫申請失敗" },
      });
      throw err;
    }
  };

export const deleteOutStockRequest =
  (outStockRequestId: number) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.patch(
        `/api/stock/outStock/rollback/${outStockRequestId}`
      );

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "刪除出庫申請失敗" },
      });
      throw err;
    }
  };

export const getWaitHandleList =
  () =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get("/api/stock/outStock/waitHandleList/basic");

      dispatch({
        type: GET_OutStockRequests,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得待處理列表" },
      });
      throw err;
    }
  };

export const getWaitHandleListWithInterval =
  (startDate: string, endDate: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get(
        `/api/stock/outStock/waitHandleList/interval?startDate=${startDate}&endDate=${endDate}`
      );

      dispatch({
        type: GET_OutStockRequests,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得區間待處理列表" },
      });
      throw err;
    }
  };

export const updateOutStockRequests =
  (outStockUpdateRequest: OutStockUpdateRequest) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      return await API.patch("/api/stock/outStock/update", outStockUpdateRequest);
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "更新出庫申請失敗" },
      });
      throw err;
    }
  };

export const getProductHistory =
  (request: ProductHistoryRequest) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get(
        `/api/stock/queryStock/history/${request.productNo}?startDate=${request.startDate}&endDate=${request.endDate}`
      );

      dispatch({
        type: GET_StockInfoes,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得商品歷史紀錄" },
      });
      throw err;
    }
  };

export const missionTrigger = async (
  periodType: string,
  fn: string
): Promise<AxiosResponse> => {
  return await API.get(`/api/stock/stockManagement/${periodType}/${fn}`);
};

export const getAllCategory =
  () =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get("/api/stock/queryStock/categoryList");

      dispatch({
        type: GET_StockInfoes,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得類別列表" },
      });
      throw err;
    }
  };

export const findCategoryDetails =
  (category: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      dispatch({
        type: CREATE_FILE,
      });

      return await API.get(`/api/stock/queryStock/category/${category}`);
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得類別詳細資訊" },
      });
      throw err;
    }
  };
