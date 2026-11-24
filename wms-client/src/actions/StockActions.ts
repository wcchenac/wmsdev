import { AxiosResponse } from "axios";
import API from "../utilities/API";
import { mutateThenRefresh } from "../utilities/mutateThenRefresh";
import { isDuplicateRequest } from "../utilities/requestDedup";
import { RollbackError, rollbackThenQueryList } from "../utilities/rollbackRequest";
import {
  GET_Order,
  GET_StockInfoes,
  GET_ShrinkList,
  GET_InStockRollbackList,
  GET_ShrinkRollbackList,
  GET_ProductHistory,
  GET_Categories,
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

async function runWithDispatchError(
  dispatch: AppDispatch,
  errorType: string,
  fallbackMessage: string,
  run: () => Promise<AxiosResponse>
): Promise<AxiosResponse> {
  try {
    return await run();
  } catch (err) {
    if (isDuplicateRequest(err)) {
      throw err;
    }
    const error = err as { response?: { data?: unknown } };
    dispatch({
      type: errorType,
      payload: error.response?.data || { message: fallbackMessage },
    });
    throw err;
  }
}

function createOrderQueryAction(orderKind: string, fallbackMessage: string) {
  return (orderNo: string) =>
    (dispatch: AppDispatch): Promise<AxiosResponse> =>
      runWithDispatchError(dispatch, GET_Errors, fallbackMessage, async () => {
        const res = await API.get(
          `/api/stock/queryOrder/${orderKind}/${encodeURIComponent(orderNo)}`
        );
        dispatch({ type: GET_Order, payload: res.data });
        return res;
      });
}

export const getInStockOrder = createOrderQueryAction("inStock", "無法取得入庫單");

export const getAssembleOrder = createOrderQueryAction("assemble", "無法取得組裝單");

export const getCustomerReturnOrder = createOrderQueryAction("customerReturn", "無法取得客退單");

export const getStoreReturnOrder = createOrderQueryAction("storeReturn", "無法取得門市退貨單");

export const getOutStockToStoreOrder = createOrderQueryAction("outStockToStore", "無法取得出貨至門市單");

export const getStockInfoesBasic =
  (productNo: string) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "無法取得庫存基本資訊", async () => {
      const res = await API.get(
        `/api/stock/queryStock/query/2/${encodeURIComponent(productNo)}`
      );
      dispatch({ type: GET_StockInfoes, payload: res.data });
      return res;
    });

export const getStockInfoes =
  (productNo: string) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "無法取得庫存詳細資訊", async () => {
      const res = await API.get(
        `/api/stock/queryStock/query/1/${encodeURIComponent(productNo)}`
      );
      dispatch({ type: GET_StockInfoes, payload: res.data });
      return res;
    });

export const getShrinkList =
  () =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "無法取得減肥清單", async () => {
      const res = await API.get("/api/stock/queryStock/shrinkList");
      dispatch({ type: GET_ShrinkList, payload: res.data });
      return res;
    });

export const stockIdentifierIsShiped =
  (shipRequest: ShipRequest) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "出貨操作失敗", async () => {
      const res = await API.patch("/api/stock/shipStock", shipRequest);
      dispatch({ type: SHIP_Stock, payload: shipRequest.stockIdentifierId });
      return res;
    });

export const stockIdentifiersAreShiped =
  (productNo: string, shipRequests: ShipRequest[]) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> =>
    mutateThenRefresh({
      dispatch,
      errorType: GET_Errors,
      mutate: () => API.patch("/api/stock/shipStocks", shipRequests),
      mutateErrorMessage: "批次出貨操作失敗",
      refresh: async () => {
        const res = await API.get(
          `/api/stock/queryStock/query/1/${encodeURIComponent(productNo)}`
        );
        dispatch({
          type: SHIP_Stocks,
          payload: res.data,
        });
        return res;
      },
      refreshErrorMessage: "批次出貨已完成，但重新整理庫存失敗，請重新查詢",
    });

export const stockIdentifierIsNotShiped =
  (stockIdentifierId: number) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "取消出貨操作失敗", () =>
      API.patch(
        `/api/stock/shipStock/rollback/${encodeURIComponent(stockIdentifierId)}`
      )
    );

export const stockIdentifierWaitToShrinkIsTrue =
  (stockIdentifierId: number) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> =>
    mutateThenRefresh({
      dispatch,
      errorType: GET_Errors,
      mutate: () =>
        API.patch(`/api/stock/waitToShrink/${encodeURIComponent(stockIdentifierId)}`),
      mutateErrorMessage: "設定待減肥失敗",
      refresh: async (result) => {
        const productNo: string = result.data;
        const res = await API.get(
          `/api/stock/queryStock/query/1/${encodeURIComponent(productNo)}`
        );
        dispatch({
          type: SHRINK_Stock,
          payload: res.data,
        });
        return res;
      },
      refreshErrorMessage: "設定待減肥已完成，但重新整理庫存失敗，請重新查詢",
    });

export const stockIdentifierWaitToShrinkIsFalse =
  (stockIdentifierId: number) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "取消待減肥失敗", async () => {
      const res = await API.patch(
        `/api/stock/waitToShrink/rollback/${encodeURIComponent(stockIdentifierId)}`
      );
      dispatch({ type: CANCEL_SHRINK, payload: stockIdentifierId });
      return res;
    });

export const batchCreateStockInfoes =
  (inStockRequests: InStockRequest[]) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, CREATE_Errors, "批次入庫失敗", () =>
      API.post("/api/stock/inStocks", inStockRequests)
    );

export const batchCreateStockInfoesForShrink =
  (shrinkStockRequest: ShrinkStockRequest) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, SHRINK_Errors, "減肥入庫失敗", () =>
      API.post("/api/stock/shrinkStock", shrinkStockRequest)
    );

export const getInStockRollbackList =
  (orderType: string, orderNo: string) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "無法取得入庫回朔列表", async () => {
      const res = await API.get(
        `/api/stock/queryStock/inStockRollback?orderType=${encodeURIComponent(orderType)}&orderNo=${encodeURIComponent(orderNo)}`
      );
      dispatch({ type: GET_InStockRollbackList, payload: res.data });
      return res;
    });

/**
 * Puts a failed rollback in state.errors, like the other actions. When the rollback went
 * through and only the list query after it failed, it stores that instead of a failure.
 */
const dispatchRollbackError = (dispatch: AppDispatch, err: unknown, fallbackMessage: string): void => {
  if (isDuplicateRequest(err)) {
    return;
  }
  if (err instanceof RollbackError && err.rolledBack) {
    dispatch({ type: GET_Errors, payload: { message: err.message } });
    return;
  }
  const requestError = err instanceof RollbackError ? err.requestError : err;
  const error = requestError as { response?: { data?: unknown } } | undefined;
  dispatch({
    type: GET_Errors,
    payload: error?.response?.data || { message: fallbackMessage },
  });
};

/**
 * Rolls back the in-stock records, then queries the order's list again — also when the
 * rollback fails (the backend then changed nothing and the list may be stale). Rejects with a
 * RollbackError saying what happened, or the 401 as is.
 */
export const inStockRollback =
  (idList: number[], orderType: string, orderNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      return await rollbackThenQueryList(
        () => API.patch("/api/stock/inStocks/rollback", idList),
        async () => {
          const res = await API.get(
            `/api/stock/queryStock/inStockRollback?orderType=${encodeURIComponent(orderType)}&orderNo=${encodeURIComponent(orderNo)}`
          );
          dispatch({
            type: GET_InStockRollbackList,
            payload: res.data,
          });
          return res;
        }
      );
    } catch (err) {
      dispatchRollbackError(dispatch, err, "入庫回朔失敗");
      throw err;
    }
  };

export const getShrinkRollbackList =
  (productNo: string) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "無法取得減肥回朔列表", async () => {
      const res = await API.get(
        `/api/stock/queryStock/shrinkRollback/${encodeURIComponent(productNo)}`
      );
      dispatch({ type: GET_ShrinkRollbackList, payload: res.data });
      return res;
    });

/**
 * Rolls back a roll's shrink, then queries the product's list again — also when the rollback
 * fails (the backend then changed nothing and the list may be stale). Rejects with a
 * RollbackError saying what happened, or the 401 as is.
 */
export const shrinkRollback =
  (stockIdentifierId: number, productNo: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      return await rollbackThenQueryList(
        () => API.patch(`/api/stock/shrinkStock/rollback/${encodeURIComponent(stockIdentifierId)}`),
        async () => {
          const res = await API.get(
            `/api/stock/queryStock/shrinkRollback/${encodeURIComponent(productNo)}`
          );
          dispatch({
            type: GET_ShrinkRollbackList,
            payload: res.data,
          });
          return res;
        }
      );
    } catch (err) {
      dispatchRollbackError(dispatch, err, "減肥回朔失敗");
      throw err;
    }
  };

export const updateStockInfo =
  (updateInfoRequest: UpdateStockInfoRequest) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> =>
    mutateThenRefresh({
      dispatch,
      errorType: UPDATE_Errors,
      mutate: () => API.patch("/api/stock/updateStock", updateInfoRequest),
      mutateErrorMessage: "更新庫存資訊失敗",
      refresh: async (result) => {
        const productNo: string = result.data;
        const res = await API.get(
          `/api/stock/queryStock/query/1/${encodeURIComponent(productNo)}`
        );
        dispatch({
          type: UPDATE_StockInfo,
          payload: res.data,
        });
        return res;
      },
      refreshErrorMessage: "更新庫存資訊已完成，但重新整理庫存失敗，請重新查詢",
    });

export const createOutStockRequest =
  (outStockRequest: OutStockRequestCreate) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "建立出庫申請失敗", () =>
      API.post("/api/stock/outStock", outStockRequest)
    );

export const deleteOutStockRequest =
  (outStockRequestId: number) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "刪除出庫申請失敗", () =>
      API.patch(`/api/stock/outStock/rollback/${encodeURIComponent(outStockRequestId)}`)
    );

export const getWaitHandleList =
  () =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "無法取得待處理列表", async () => {
      const res = await API.get("/api/stock/outStock/waitHandleList/basic");
      dispatch({ type: GET_OutStockRequests, payload: res.data });
      return res;
    });

export const getWaitHandleListWithInterval =
  (startDate: string, endDate: string) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "無法取得區間待處理列表", async () => {
      const res = await API.get(
        `/api/stock/outStock/waitHandleList/interval?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      );
      dispatch({ type: GET_OutStockRequests, payload: res.data });
      return res;
    });

export const updateOutStockRequests =
  (outStockUpdateRequest: OutStockUpdateRequest) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "更新出庫申請失敗", () =>
      API.patch("/api/stock/outStock/update", outStockUpdateRequest)
    );

export const getProductHistory =
  (request: ProductHistoryRequest) =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "無法取得商品歷史紀錄", async () => {
      const res = await API.get(
        `/api/stock/queryStock/history/${encodeURIComponent(request.productNo)}?startDate=${encodeURIComponent(request.startDate)}&endDate=${encodeURIComponent(request.endDate)}`
      );
      dispatch({ type: GET_ProductHistory, payload: res.data });
      return res;
    });

export const missionTrigger = async (
  periodType: string,
  fn: string
): Promise<AxiosResponse> => {
  return await API.get(
    `/api/stock/stockManagement/${encodeURIComponent(periodType)}/${encodeURIComponent(fn)}`
  );
};

export const getAllCategory =
  () =>
  (dispatch: AppDispatch): Promise<AxiosResponse> =>
    runWithDispatchError(dispatch, GET_Errors, "無法取得類別列表", async () => {
      const res = await API.get("/api/stock/queryStock/categoryList");
      dispatch({ type: GET_Categories, payload: res.data });
      return res;
    });

export const findCategoryDetails =
  (category: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    dispatch({
      type: CREATE_FILE,
    });

    try {
      return await runWithDispatchError(dispatch, GET_Errors, "無法取得類別詳細資訊", () =>
        API.get(`/api/stock/queryStock/category/${encodeURIComponent(category)}`)
      );
    } finally {
      dispatch({
        type: CREATE_FILE,
        payload: false,
      });
    }
  };
