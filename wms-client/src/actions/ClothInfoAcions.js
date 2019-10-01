import axios from "axios";
import {
  GET_ClothInfoes,
  GET_Errors,
  SHIP_Cloth,
  DELETE_Cloth,
  SHRINK_Cloth,
  CANCEL_SHRINK
} from "./types";

export const createClothInfo = (inStockRequest, history) => async dispatch => {
  try {
    await axios.post("/api/cloth/inStock", inStockRequest);
    history.push("/cloth/1/1");
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response.data
    });
  }
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

// To be deprecated
export const purgeOldClothIndentifierNotExist = clothIdentifierId => async dispatch => {
  try {
    await axios.patch(`/api/cloth/purgeStock/${clothIdentifierId}`);
    dispatch({
      type: DELETE_Cloth,
      payload: null
    });
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response.data
    });
  }
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
      payload: err.response.data
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
      payload: err.response.data
    });
  }
};

export const clothIdentifierWaitToShrinkIsFalse = clothIdentifierId => async dispatch => {
  try {
    await axios.patch(`/api/cloth/rollbackWaitToShrink/${clothIdentifierId}`);
    dispatch({
      type: CANCEL_SHRINK,
      payload: clothIdentifierId
    });
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response.data
    });
  }
};

export const batchCreateClothInfoes = (
  inStockRequests
) => async dispatch => {
  try {
    await axios.post("/api/cloth/inStocks", inStockRequests);
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const batchCreateClothInfoesForShrink = (
  shrinkStockRequest,
  history
) => async dispatch => {
  try {
    await axios.post("/api/cloth/shrinkStock", shrinkStockRequest);

    // for (let i = 0; i < inStockRequests.length; i += 1) {
    //   await axios.post("/api/cloth/inStock", inStockRequests[i]);
    // }
    // let productNo = shrinkStockRequest.inStockRequests[0].productNo;
    // const res = await axios.get(`/api/cloth/queryStock/${productNo}`);

    // dispatch({
    //   type: GET_ClothInfoes,
    //   payload: res.data
    // });

    history.replace("/cloth/3/2");
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};
