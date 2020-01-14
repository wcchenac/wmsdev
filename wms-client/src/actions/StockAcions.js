import axios from "axios";
import { trackPromise } from "react-promise-tracker";
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
  CREATE_FILE,
  UPDATE_StockInfo,
  UPDATE_Errors
} from "./types";

export const getInStockOrder = inStockOrderNo => async dispatch => {
  // const res = await trackPromise(
  //   axios.get(`/api/stock/queryOrder/inStock/${inStockOrderNo}`)
  // );

  const res = await axios.get(
    `/api/stock/queryOrder/inStock/${inStockOrderNo}`
  );

  dispatch({
    type: GET_Order,
    payload: res.data
  });

  return res;
};

export const getAssembleOrder = assembleOrderNo => async dispatch => {
  // const res = await trackPromise(
  //   axios.get(`/api/stock/queryOrder/assemble/${assembleOrderNo}`)
  // );

  const res = await axios.get(
    `/api/stock/queryOrder/assemble/${assembleOrderNo}`
  );
  dispatch({
    type: GET_Order,
    payload: res.data
  });

  return res;
};

export const getStockInfoesBasic = productNo => async dispatch => {
  // const res = await trackPromise(
  //   axios.get(`/api/stock/queryStock/query/${productNo}/basic`)
  // );

  const res = await axios.get(`/api/stock/queryStock/query/${productNo}/basic`);

  dispatch({
    type: GET_StockInfoes,
    payload: res.data
  });

  return res;
};

export const getStockInfoes = productNo => async dispatch => {
  // const res = await trackPromise(
  //   axios.get(`/api/stock/queryStock/query/${productNo}`)
  // );

  const res = await axios.get(`/api/stock/queryStock/query/${productNo}`);
  dispatch({
    type: GET_StockInfoes,
    payload: res.data
  });

  return res;
};

export const getShrinkList = () => async dispatch => {
  // const res = await trackPromise(axios.get("/api/stock/queryStock/shrinkList"));
  const res = await axios.get("/api/stock/queryStock/shrinkList");

  dispatch({
    type: GET_StockInfoes,
    payload: res.data
  });

  return res;
};

export const stockIdentifierIsShiped = shipRequest => async dispatch => {
  try {
    // await trackPromise(axios.patch("/api/stock/shipStock", shipRequest));

    const res = await axios.patch("/api/stock/shipStock", shipRequest);

    dispatch({
      type: SHIP_Stock,
      payload: shipRequest.stockIdentifierId
    });

    return res;
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const stockIdentifierIsNotShiped = stockIdentifierId => async dispatch => {
  try {
    // const res = await trackPromise(
    //   axios.patch(`/api/stock/shipStock/rollback/${stockIdentifierId}`)
    // );
    const res = await axios.patch(
      `/api/stock/shipStock/rollback/${stockIdentifierId}`
    );
    return res;
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const stockIdentifierWaitToShrinkIsTrue = stockIdentifierId => async dispatch => {
  try {
    // let result = await trackPromise(
    //   axios.patch(`/api/stock/waitToShrink/${stockIdentifierId}`)
    // );
    let result = await axios.patch(
      `/api/stock/waitToShrink/${stockIdentifierId}`
    );
    let productNo = result.data;
    // const res = await trackPromise(
    //   axios.get(`/api/stock/queryStock/query/${productNo}`)
    // );

    const res = await axios.get(`/api/stock/queryStock/query/${productNo}`);
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
    // await trackPromise(
    //   axios.patch(`/api/stock/waitToShrink/rollback/${stockIdentifierId}`)
    // );
    const res = await axios.patch(
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
    // const res = await trackPromise(
    //   axios.post("/api/stock/inStocks", inStockRequests)
    // );

    const res = await axios.post("/api/stock/inStocks", inStockRequests);
    return res;
  } catch (err) {
    dispatch({
      type: CREATE_Errors,
      payload: err.response
    });
  }
};

export const batchCreateStockInfoesForShrink = shrinkStockRequest => async dispatch => {
  try {
    // const res = await trackPromise(
    //   axios.post("/api/stock/shrinkStock", shrinkStockRequest)
    // );
    const res = await axios.post("/api/stock/shrinkStock", shrinkStockRequest);
    return res;
  } catch (err) {
    dispatch({
      type: SHRINK_Errors,
      payload: err.response
    });
  }
};

export const updateStockInfo = updateInfoRequest => async dispatch => {
  try {
    // let result = await trackPromise(
    //   axios.patch("/api/stock/updateStock", updateInfoRequest)
    // );
    let result = await axios.patch("/api/stock/updateStock", updateInfoRequest);
    let productNo = result.data;
    // const res = await trackPromise(
    //   axios.get(`/api/stock/queryStock/query/${productNo}`)
    // );
    const res = await axios.get(`/api/stock/queryStock/query/${productNo}`);
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
    // await trackPromise(axios.post("/api/stock/outStock", outStockRequest));
    const res = await axios.post("/api/stock/outStock", outStockRequest);

    return res;
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const deleteOutStockRequest = outStockRequestId => async dispatch => {
  try {
    // const res = await trackPromise(
    //   axios.patch(`/api/stock/outStock/rollback/${outStockRequestId}`)
    // );
    const res = await axios.patch(
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
  // const res = await trackPromise(
  //   axios.get("/api/stock/outStock/waitHandleList/basic")
  // );
  const res = await axios.get("/api/stock/outStock/waitHandleList/basic");
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
  // const res = await trackPromise(
  //   axios.get(
  //     `/api/stock/outStock/waitHandleList/interval?startDate=${startDate}&endDate=${endDate}`
  //   )
  // );
  const res = await axios.get(
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
    // const res = await trackPromise(
    //   axios.patch("/api/stock/outStock/update", outStockUpdateRequest)
    // );
    const res = await axios.patch(
      "/api/stock/outStock/update",
      outStockUpdateRequest
    );
    dispatch({
      type: CREATE_FILE
    });

    return res;
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const getProductHistory = request => async dispatch => {
  // const res = await trackPromise(
  //   axios.get(
  //     `/api/stock/queryStock/history/${request.productNo}?startDate=${request.startDate}&endDate=${request.endDate}`
  //   )
  // );
  const res = await axios.get(
    `/api/stock/queryStock/history/${request.productNo}?startDate=${request.startDate}&endDate=${request.endDate}`
  );
  dispatch({
    type: GET_StockInfoes,
    payload: res.data
  });

  return res;
};
