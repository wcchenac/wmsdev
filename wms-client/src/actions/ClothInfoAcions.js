import axios from "axios";
import { GET_ClothInfoes, GET_Errors } from "./types";

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
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response.data
    });
  }
};

export const purgeOldClothInfoIsSaled = clothIdentifierId => async dispatch => {
  try {
    await axios.patch(`/api/cloth/saleStock/${clothIdentifierId}`);
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
    history.replace({
      pathname: "/cloth/3",
      state: {
        productNo: history.location.state.clothInfo.clothIdentifier.productNo
      }
    });
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response.data
    });
  }
};
