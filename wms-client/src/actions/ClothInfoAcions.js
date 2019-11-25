import axios from "axios";
import {
  GET_Order,
  GET_ClothInfoes,
  GET_Errors,
  SHIP_Cloth,
  SHRINK_Cloth,
  CANCEL_SHRINK,
  GET_OutStockRequests,
  CREATE_FILE
} from "./types";

export const getInStockOrder = inStockOrderNo => async dispatch => {
  const res = await axios.get(`/api/cloth/queryInStockOrder/${inStockOrderNo}`);
  console.log(res);
  dispatch({
    type: GET_Order,
    payload: res.data
  });
};

export const getClothInfoesBasic = productNo => async dispatch => {
  const res = await axios.get(`/api/cloth/queryStock/${productNo}/basic`);

  dispatch({
    type: GET_ClothInfoes,
    payload: res.data
  });
};

export const getClothInfoes = productNo => async dispatch => {
  const res = await axios.get(`/api/cloth/queryStock/${productNo}`);

  dispatch({
    type: GET_ClothInfoes,
    payload: res.data
  });
};

export const getShrinkList = () => async dispatch => {
  const res = await axios.get("/api/cloth/queryStock/shrinkList");

  dispatch({
    type: GET_ClothInfoes,
    payload: res.data
  });
};

export const clothIndentifierIsShiped = shipRequest => async dispatch => {
  try {
    await axios.patch("/api/cloth/shipStock", shipRequest);

    dispatch({
      type: SHIP_Cloth,
      payload: shipRequest.clothIdentifierId
    });
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const clothIndentifierIsNotShiped = clothIdentifierId => async dispatch => {
  try {
    await axios.patch(`/api/cloth/rollback/shipStock/${clothIdentifierId}`);
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const clothIdentifierWaitToShrinkIsTrue = clothIdentifierId => async dispatch => {
  try {
    let result = await axios.patch(
      `/api/cloth/waitToShrink/${clothIdentifierId}`
    );
    let productNo = result.data;
    const res = await axios.get(`/api/cloth/queryStock/${productNo}`);

    dispatch({
      type: SHRINK_Cloth,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const clothIdentifierWaitToShrinkIsFalse = clothIdentifierId => async dispatch => {
  try {
    await axios.patch(`/api/cloth/rollback/waitToShrink/${clothIdentifierId}`);

    dispatch({
      type: CANCEL_SHRINK,
      payload: clothIdentifierId
    });
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const batchCreateClothInfoes = inStockRequests => async dispatch => {
  try {
    await axios.post("/api/cloth/inStocks", inStockRequests);
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const batchCreateClothInfoesForShrink = shrinkStockRequest => async dispatch => {
  try {
    await axios.post("/api/cloth/shrinkStock", shrinkStockRequest);
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const createOutStockRequest = outStockRequest => async dispatch => {
  try {
    await axios.post("/api/cloth/outStock", outStockRequest);
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const deleteOutStockRequest = outStockRequestId => async dispatch => {
  try {
    await axios.patch(`/api/cloth/rollback/outStock/${outStockRequestId}`);
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const getWaitHandleList = () => async dispatch => {
  const res = await axios.get("/api/cloth/outStock/waitHandleList/basic");

  dispatch({
    type: GET_OutStockRequests,
    payload: res.data
  });
};

export const getWaitHandleListWithInterval = (
  startDate,
  endDate
) => async dispatch => {
  const res = await axios.get(
    `/api/cloth/outStock/waitHandleList/interval/${startDate}&${endDate}`
  );

  dispatch({
    type: GET_OutStockRequests,
    payload: res.data
  });
};

export const updateOutStockRequests = outStockUpdateRequest => async dispatch => {
  try {
    await axios.patch("/api/cloth/outStock/update", outStockUpdateRequest);

    dispatch({
      type: CREATE_FILE
    });
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};
