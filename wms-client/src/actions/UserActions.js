import axios from "axios";
import {
  SET_Current_User,
  GET_UserList,
  UPDATE_User,
  DELETE_User,
  GET_Errors
} from "../actions/types";
import SetJWTToken from "../utilities/SetJWTToken";
import jwt_decode from "jwt-decode";

export const registerUser = (newUser, history) => async dispatch => {
  try {
    return await axios.post("/api/user/adminManagement/user/register", newUser);
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response.data
    });
  }
};

export const login = loginRequest => async dispatch => {
  try {
    const res = await axios.post("/api/user/login", loginRequest);
    const token = res.data.accessToken;

    localStorage.setItem("jwtToken", token);

    SetJWTToken(token);

    const decodedJWT = jwt_decode(token);

    dispatch({
      type: SET_Current_User,
      payload: decodedJWT
    });
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response.data
    });
  }
};

export const logout = () => dispatch => {
  localStorage.removeItem("jwtToken");

  SetJWTToken(false);

  dispatch({
    type: SET_Current_User,
    payload: {}
  });
};

export const getUserList = () => async dispatch => {
  const res = await axios.get("/api/user/adminManagement/user/userList");

  dispatch({
    type: GET_UserList,
    payload: res.data
  });

  return res;
};

export const deleteUser = employeeId => async dispatch => {
  try {
    const res = await axios.delete(
      `/api/user/adminManagement/user/delete?employeeId=${employeeId}`
    );

    dispatch({
      type: DELETE_User,
      payload: employeeId
    });

    return res;
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response
    });
  }
};

export const updateUser = updateInfoRequest => async dispatch => {
  try {
    await axios.patch(
      "/api/user/adminManagement/user/update",
      updateInfoRequest
    );

    const res = await axios.get("/api/user/adminManagement/user/userList");

    dispatch({
      type: UPDATE_User,
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
