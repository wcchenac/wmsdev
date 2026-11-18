import { AxiosResponse } from "axios";
import { jwtDecode } from "jwt-decode";
import API from "../utilities/API";
import SetJWTToken from "../utilities/SetJWTToken";
import { mutateThenRefresh } from "../utilities/mutateThenRefresh";
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

/**
 * Registers a user. On failure it stores only the generic message: UserRegister shows no
 * messages from the store (it picks its toast from the rethrown error), and the response body
 * can be a Spring error body with the exception text.
 */
export const registerUser =
  (newUser: RegisterUserRequest) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse> => {
    try {
      return await API.post("/api/user/adminManagement/user/register", newUser);
    } catch (err) {
      dispatch({
        type: GET_Errors,
        payload: { message: "註冊失敗" },
      });
      throw err;
    }
  };

const LOGIN_FAILED_MESSAGE = "登入失敗，請檢查帳號密碼";

/**
 * The field messages of a rejected login (backend InvalidLoginResponse:
 * { username, password }), keeping only those two string fields. Anything else (no response,
 * a proxy's HTML error page, a Spring error body with the exception text) gives undefined,
 * so the form shows LOGIN_FAILED_MESSAGE instead.
 */
function invalidLoginMessages(data: unknown): { username?: string; password?: string } | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const username = "username" in data && typeof data.username === "string" ? data.username : undefined;
  const password = "password" in data && typeof data.password === "string" ? data.password : undefined;
  if (username === undefined && password === undefined) return undefined;
  return {
    ...(username !== undefined && { username }),
    ...(password !== undefined && { password }),
  };
}

export const login =
  (loginRequest: LoginRequest) =>
  async (dispatch: AppDispatch): Promise<AxiosResponse | void> => {
    try {
      const res = await API.post("/api/user/login", loginRequest);
      const token: unknown = res.data?.accessToken;
      if (typeof token !== "string" || token.trim() === "") {
        throw new Error("Invalid login token");
      }

      // Decode and validate claims before persisting the token to storage or default headers.
      const decodedJWT = jwtDecode<DecodedToken>(token);
      if (
        !decodedJWT ||
        typeof decodedJWT !== "object" ||
        typeof decodedJWT.exp !== "number" ||
        decodedJWT.exp <= Date.now() / 1000
      ) {
        throw new Error("Invalid decoded token");
      }

      localStorage.setItem("jwtToken", token);

      SetJWTToken(token);

      dispatch({
        type: SET_Current_User,
        payload: decodedJWT,
      });
      dispatch({
        type: GET_Errors,
        payload: null,
      });

      return res;
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      dispatch({
        type: GET_Errors,
        payload: invalidLoginMessages(error.response?.data) ?? { message: LOGIN_FAILED_MESSAGE },
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
        `/api/user/adminManagement/user/delete?employeeId=${encodeURIComponent(employeeId)}`
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
  async (dispatch: AppDispatch): Promise<AxiosResponse> =>
    mutateThenRefresh({
      dispatch,
      errorType: GET_Errors,
      mutate: () =>
        API.patch("/api/user/adminManagement/user/update", updateInfoRequest),
      mutateErrorMessage: "更新使用者失敗",
      refresh: async () => {
        const res = await API.get("/api/user/adminManagement/user/userList");
        dispatch({
          type: UPDATE_User,
          payload: res.data,
        });
        return res;
      },
      refreshErrorMessage: "更新使用者已完成，但重新整理列表失敗，請重新整理頁面",
    });
