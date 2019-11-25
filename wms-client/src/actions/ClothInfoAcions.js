import axios from "axios";
import { trackPromise } from "react-promise-tracker";
import {
  GET_Order,
  GET_ClothInfoes,
  GET_Errors,
  CREATE_Errors,
  SHRINK_Errors,
  SHIP_Cloth,
  SHRINK_Cloth,
  CANCEL_SHRINK,
  GET_OutStockRequests,
  CREATE_FILE,
  UPDATE_ClothInfo,
  UPDATE_Errors
} from "./types";

export const getInStockOrder = inStockOrderNo => async dispatch => {
  const res = await trackPromise(
    axios.get(`/api/cloth//queryOrder/inStock/${inStockOrderNo}`)
  );

  dispatch({
    type: GET_Order,
    payload: res.data
  });
};

export const getAssembleOrder = assembleOrderNo => async dispatch => {
  const res = await trackPromise(
    axios.get(`/api/cloth/queryOrder/assemble/${assembleOrderNo}`)
  );

  dispatch({
    type: GET_Order,
    payload: res.data
  });
};

export const getClothInfoesBasic = productNo => async dispatch => {
  const res = await trackPromise(
    axios.get(`/api/cloth/queryStock/query/${productNo}/basic`)
  );

  dispatch({
    type: GET_ClothInfoes,
    payload: res.data
  });

  return res;
};

export const getClothInfoes = productNo => async dispatch => {
  const res = await trackPromise(
    axios.get(`/api/cloth/queryStock/query/${productNo}`)
  );

  dispatch({
    type: GET_ClothInfoes,
    payload: res.data
  });

  return res;
};

export const getShrinkList = () => async dispatch => {
  const res = await trackPromise(axios.get("/api/cloth/queryStock/shrinkList"));

  dispatch({
    type: GET_ClothInfoes,
    payload: res.data
  });
};

export const clothIndentifierIsShiped = shipRequest => async dispatch => {
  try {
    await trackPromise(axios.patch("/api/cloth/shipStock", shipRequest));

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
    const res = await trackPromise(
      axios.patch(`/api/cloth/shipStock/rollback/${clothIdentifierId}`)
    );

    return res;
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const clothIdentifierWaitToShrinkIsTrue = clothIdentifierId => async dispatch => {
  try {
    let result = await trackPromise(
      axios.patch(`/api/cloth/waitToShrink/${clothIdentifierId}`)
    );
    let productNo = result.data;
    const res = await trackPromise(
      axios.get(`/api/cloth/queryStock/query/${productNo}`)
    );

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
    await trackPromise(
      axios.patch(`/api/cloth/waitToShrink/rollback/${clothIdentifierId}`)
    );

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
    const res = await trackPromise(
      axios.post("/api/cloth/inStocks", inStockRequests)
    );

    return res;
  } catch (err) {
    dispatch({
      type: CREATE_Errors,
      payload: err.response
    });
  }
};

export const batchCreateClothInfoesForShrink = shrinkStockRequest => async dispatch => {
  try {
    const res = await trackPromise(
      axios.post("/api/cloth/shrinkStock", shrinkStockRequest)
    );

    return res;
  } catch (err) {
    dispatch({
      type: SHRINK_Errors,
      payload: err.response
    });
  }
};

export const updateClothInfo = updateInfoRequest => async dispatch => {
  try {
    let result = await trackPromise(
      axios.patch("/api/cloth/updateStock", updateInfoRequest)
    );
    let productNo = result.data;
    const res = await trackPromise(
      axios.get(`/api/cloth/queryStock/query/${productNo}`)
    );

    dispatch({
      type: UPDATE_ClothInfo,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: UPDATE_Errors,
      payload: err.response
    });
  }
};

export const createOutStockRequest = outStockRequest => async dispatch => {
  try {
    await trackPromise(axios.post("/api/cloth/outStock", outStockRequest));
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const deleteOutStockRequest = outStockRequestId => async dispatch => {
  try {
    const res = await trackPromise(
      axios.patch(`/api/cloth/outStock/rollback/${outStockRequestId}`)
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
  const res = await trackPromise(
    axios.get("/api/cloth/outStock/waitHandleList/basic")
  );

  dispatch({
    type: GET_OutStockRequests,
    payload: res.data
  });
};

export const getWaitHandleListWithInterval = (
  startDate,
  endDate
) => async dispatch => {
  const res = await trackPromise(
    axios.get(
      `/api/cloth/outStock/waitHandleList/interval/?date=${startDate}&${endDate}`
    )
  );

  dispatch({
    type: GET_OutStockRequests,
    payload: res.data
  });
};

export const updateOutStockRequests = outStockUpdateRequest => async dispatch => {
  try {
    const res = await trackPromise(
      axios.patch("/api/cloth/outStock/update", outStockUpdateRequest)
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
