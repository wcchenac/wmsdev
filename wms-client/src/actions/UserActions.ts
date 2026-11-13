import { AxiosResponse } from "axios";
import { jwtDecode } from "jwt-decode";
import API from "../utilities/API";
import SetJWTToken from "../utilities/SetJWTToken";
import {
  SET_Current_User,
  GET_UserList,
  UPDATE_User,
  DELETE_User,
  GET_Errors,
  AppDispatch,
  User,
  LoginRequest,
  RegisterUserRequest,
  UpdateUserRequest,
} from "../types";

interface DecodedToken extends User {
  iat: number;
  exp: number;
}

export const registerUser =
  (newUser: RegisterUserRequest) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      return await API.post("/api/user/adminManagement/user/register", newUser);
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "註冊失敗" },
      });
      throw err;
    }
  };

export const login =
  (loginRequest: LoginRequest) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse | void> => {
    try {
      const res = await API.post("/api/user/login", loginRequest);
      const token: string = res.data.accessToken;

      localStorage.setItem("jwtToken", token);

      SetJWTToken(token);

      const decodedJWT = jwtDecode<DecodedToken>(token);

      dispatch({
        type: SET_Current_User,
        payload: decodedJWT,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      const data = error.response?.data;
      // A rejected login answers with { username, password } messages. Anything else (no
      // response, or a proxy's HTML error page when the backend is down) gets the generic
      // message, so the form always receives an object it can show.
      dispatch({
        type: GET_Errors,
        payload:
          data !== null && typeof data === "object" && !Array.isArray(data)
            ? data
            : { message: "登入失敗，請檢查帳號密碼" },
      });
    }
  };

export const logout = () => (dispatch: AppDispatch): void => {
  localStorage.removeItem("jwtToken");

  SetJWTToken(false);

  dispatch({
    type: SET_Current_User,
    payload: {},
  });
};

export const getUserList =
  () =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.get("/api/user/adminManagement/user/userList");

      dispatch({
        type: GET_UserList,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "無法取得使用者列表" },
      });
      throw err;
    }
  };

export const deleteUser =
  (employeeId: string) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      const res = await API.delete(
        `/api/user/adminManagement/user/delete?employeeId=${employeeId}`
      );

      dispatch({
        type: DELETE_User,
        payload: employeeId,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "刪除使用者失敗" },
      });
      throw err;
    }
  };

export const updateUser =
  (updateInfoRequest: UpdateUserRequest) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      // Update user first, then refresh user list
      await API.patch(
        "/api/user/adminManagement/user/update",
        updateInfoRequest
      );

      const res = await API.get("/api/user/adminManagement/user/userList");

      dispatch({
        type: UPDATE_User,
        payload: res.data,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: error.response?.data || { message: "更新使用者失敗" },
      });
      throw err;
    }
  };
