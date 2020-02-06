// import axios from "axios";
import API from "../utilities/API";
import {
  GET_Order,
  GET_StockInfoes,
  GET_Errors,
  CREATE_Errors,
  SHRINK_Errors,
  SHIP_Stock,
  SHRINK_Stock,
  CANCEL_SHRINK,
  GET_OutStockRequests,
  UPDATE_StockInfo,
  UPDATE_Errors
} from "./types";

export const getInStockOrder = inStockOrderNo => async dispatch => {
  const res = await API.get(`/api/stock/queryOrder/inStock/${inStockOrderNo}`);

  dispatch({
    type: GET_Order,
    payload: res.data
  });

  return res;
};

export const getAssembleOrder = assembleOrderNo => async dispatch => {
  const res = await API.get(
    `/api/stock/queryOrder/assemble/${assembleOrderNo}`
  );

  dispatch({
    type: GET_Order,
    payload: res.data
  });

  return res;
};

export const getCustomerReturnOrder = returnOrderNo => async dispatch => {
  const res = await API.get(
    `/api/stock/queryOrder/customerReturn/${returnOrderNo}`
  );

  dispatch({
    type: GET_Order,
    payload: res.data
  });

  return res;
};

export const getStoreReturnOrder = returnOrderNo => async dispatch => {
  const res = await API.get(
    `/api/stock/queryOrder/storeReturn/${returnOrderNo}`
  );

  dispatch({
    type: GET_Order,
    payload: res.data
  });

  return res;
};

export const getStockInfoesBasic = productNo => async dispatch => {
  const res = await API.get(`/api/stock/queryStock/query/2/${productNo}`);

  dispatch({
    type: GET_StockInfoes,
    payload: res.data
  });

  return res;
};

export const getStockInfoes = productNo => async dispatch => {
  const res = await API.get(`/api/stock/queryStock/query/1/${productNo}`);

  dispatch({
    type: GET_StockInfoes,
    payload: res.data
  });

  return res;
};

// export const getStockInfoesWithQuantity = productNo => async dispatch => {
//   const res = await API.get(`/api/stock/queryStock/query/3/${productNo}`);

//   dispatch({
//     type: GET_StockInfoes,
//     payload: res.data
//   });

//   return res;
// };

export const getShrinkList = () => async dispatch => {
  const res = await API.get("/api/stock/queryStock/shrinkList");

  dispatch({
    type: GET_StockInfoes,
    payload: res.data
  });

  return res;
};

export const stockIdentifierIsShiped = shipRequest => async dispatch => {
  try {
    dispatch({
      type: SHIP_Stock,
      payload: shipRequest.stockIdentifierId
    });

    return await API.patch("/api/stock/shipStock", shipRequest);
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const stockIdentifierIsNotShiped = stockIdentifierId => async dispatch => {
  try {
    return await API.patch(
      `/api/stock/shipStock/rollback/${stockIdentifierId}`
    );
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const stockIdentifierWaitToShrinkIsTrue = stockIdentifierId => async dispatch => {
  try {
    let result = await API.patch(
      `/api/stock/waitToShrink/${stockIdentifierId}`
    );
    let productNo = result.data;
    const res = await API.get(`/api/stock/queryStock/query/1/${productNo}`);

    dispatch({
      type: SHRINK_Stock,
      payload: res.data
    });

    return res;
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const stockIdentifierWaitToShrinkIsFalse = stockIdentifierId => async dispatch => {
  try {
    const res = await API.patch(
      `/api/stock/waitToShrink/rollback/${stockIdentifierId}`
    );

    dispatch({
      type: CANCEL_SHRINK,
      payload: stockIdentifierId
    });

    return res;
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const batchCreateStockInfoes = inStockRequests => async dispatch => {
  try {
    return await API.post("/api/stock/inStocks", inStockRequests);
  } catch (err) {
    dispatch({
      type: CREATE_Errors,
      payload: err.response
    });
  }
};

export const batchCreateStockInfoesForShrink = shrinkStockRequest => async dispatch => {
  try {
    return await API.post("/api/stock/shrinkStock", shrinkStockRequest);
  } catch (err) {
    dispatch({
      type: SHRINK_Errors,
      payload: err.response
    });
  }
};

export const updateStockInfo = updateInfoRequest => async dispatch => {
  try {
    let result = await API.patch("/api/stock/updateStock", updateInfoRequest);
    let productNo = result.data;
    const res = await API.get(`/api/stock/queryStock/query/1/${productNo}`);

    dispatch({
      type: UPDATE_StockInfo,
      payload: res.data
    });

    return res;
  } catch (err) {
    dispatch({
      type: UPDATE_Errors,
      payload: err.response
    });
  }
};

export const createOutStockRequest = outStockRequest => async dispatch => {
  try {
    return await API.post("/api/stock/outStock", outStockRequest);
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const deleteOutStockRequest = outStockRequestId => async dispatch => {
  try {
    const res = await API.patch(
      `/api/stock/outStock/rollback/${outStockRequestId}`
    );

    return res;
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const getWaitHandleList = () => async dispatch => {
  const res = await API.get("/api/stock/outStock/waitHandleList/basic");

  dispatch({
    type: GET_OutStockRequests,
    payload: res.data
  });

  return res;
};

export const getWaitHandleListWithInterval = (
  startDate,
  endDate
) => async dispatch => {
  const res = await API.get(
    `/api/stock/outStock/waitHandleList/interval?startDate=${startDate}&endDate=${endDate}`
  );

  dispatch({
    type: GET_OutStockRequests,
    payload: res.data
  });

  return res;
};

export const updateOutStockRequests = outStockUpdateRequest => async dispatch => {
  try {
    return await API.patch("/api/stock/outStock/update", outStockUpdateRequest);
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const getProductHistory = request => async dispatch => {
  const res = await API.get(
    `/api/stock/queryStock/history/${request.productNo}?startDate=${request.startDate}&endDate=${request.endDate}`
  );

  dispatch({
    type: GET_StockInfoes,
    payload: res.data
  });

  return res;
};

export const stockComparison = async periodType => {
  return await API.get(`/api/stock/stockManagement/${periodType}/stockCompare`);
};
