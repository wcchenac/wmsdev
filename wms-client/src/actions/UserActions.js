import axios from "axios";
import { SET_Current_User, GET_Errors } from "../actions/types";
import SetJWTToken from "../utilities/SetJWTToken";
import jwt_decode from "jwt-decode";

export const registerUser = (newUser, history) => async dispatch => {
  try {
    await axios.post("/api/auth/register", newUser);

    history.push("/");
  } catch (err) {
    dispatch({
      type: GET_Errors,
      payload: err.response.data
    });
  }
};

export const login = loginRequest => async dispatch => {
  try {
    const res = await axios.post("/api/auth/login", loginRequest);
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
