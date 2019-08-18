import axios from "axios";
import { GET_ClothInfo, GET_Errors } from "./types";

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
