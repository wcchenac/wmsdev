import axios from "axios";
import { GET_ClothInfoes, GET_Errors } from "./types";

export const createClothInfo = (inStockRequest, history) => async dispatch => {
  try {
    await axios.post("/api/cloth/inStock", inStockRequest);
    history.push("/cloth/instock");
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
