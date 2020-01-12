import axios from "axios";
import { GET_Errors, CREATE_FILE } from "./types";

export const createFile = request => async dispatch => {
  try {
    const res = await axios.post("/api/download/createFile", request);

    let filename = res.data;

    window.open(`http://localhost:8080/api/download/downloadFile/${filename}`);

    dispatch({
      type: CREATE_FILE,
      payload: filename
    });
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err
    });
  }
};

export const queryCategoryTodayFile = async fileCategory => {
  axios
    .get(`http://localhost:8080/api/file/query/${fileCategory}/today`)
    .then(res => {
      if (res.status === 200) {
        return res.data;
      }
    })
    .catch(err => {
      console.log(err);
    });
};

export const queryCategoryIntervalFiles = async (
  fileCategory,
  startDate,
  endDate
) => {
  axios
    .get(
      `http://localhost:8080/api/file/query/${fileCategory}/interval?startDate=${startDate}&endDate=${endDate}`
    )
    .then(res => {
      if (res.status === 200) {
        return res.data;
      }
    })
    .catch(err => {
      console.log(err);
    });
};
