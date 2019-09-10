import axios from "axios";
import { GET_ClothInfoes, GET_Errors, SHIP_Cloth, DELETE_Cloth } from "./types";

export const createClothInfo = (inStockRequest, history) => async dispatch => {
  try {
    await axios.post("/api/cloth/inStock", inStockRequest);
    history.push("/cloth/1");
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

export const purgeOldClothInfoNotExist = clothIdentifierId => async dispatch => {
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

export const purgeOldClothInfoIsShiped = clothIdentifierId => async dispatch => {
  try {
    await axios.patch(`/api/cloth/shipStock/${clothIdentifierId}`);

    dispatch({
      type: SHIP_Cloth,
      payload: clothIdentifierId
    });
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response.data
    });
  }
};

export const typeExchangeBatchCreateClothInfo = (
  inStockRequests,
  history
) => async dispatch => {
  try {
    for (let i = 0; i < inStockRequests.length; i += 1) {
      await axios.post("/api/cloth/inStock", inStockRequests[i]);
    }
    let productNo = inStockRequests[0].productNo;
    const res = await axios.get(`/api/cloth/queryStock/${productNo}`);

    dispatch({
      type: GET_ClothInfoes,
      payload: res.data
    });

    history.replace("/cloth/3");
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response.data
    });
  }
};
