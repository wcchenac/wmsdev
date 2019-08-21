import axios from "axios";
import { GET_ClothInfoes, GET_Errors } from "./types";

export const createClothInfo = (clothInfo, history) => async dispatch => {
  try {
    await axios.post("http://localhost:8080/api/cloth/inStock", clothInfo);
    history.push("http://localhost:8080");
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response.data
    });
  }
};

export const getClothInfoes = productNo => async dispatch => {
  const res = await axios.get(
    `http://localhost:8080/api/cloth/queryStock/${productNo}`
  );
  dispatch({
    type: GET_ClothInfoes,
    payload: res.data
  });
};
