import setJWTToken from "./SetJWTToken";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { UnknownAction } from "redux";
import store from "../store";
import { logout } from "../actions/UserActions";
import { SET_Current_User, User } from "../types";

/**
 * Extended JWT payload interface with User properties
 */
interface DecodedJWT extends JwtPayload, User {
  exp: number;
}

/**
 * Validates JWT token from localStorage on app initialization
 * - Checks if token exists
 * - Validates token format
 * - Checks token expiration
 * - Logs out user if token is invalid or expired
 */
function localStorageValidate(): void {
  const jwtToken = localStorage.getItem("jwtToken");

  if (jwtToken) {
    try {
      const decodedJWT = jwtDecode<DecodedJWT>(jwtToken);

      // Validate that decoded token has required fields
      if (!decodedJWT || !decodedJWT.exp) {
        throw new Error("Invalid token structure");
      }

      const currentTime = Date.now() / 1000;

      if (decodedJWT.exp < currentTime) {
        // Token expired - logout user
        store.dispatch(logout() as unknown as UnknownAction);
        window.location.href = "/";
        return;
      }

      // Token is valid - set it up
      setJWTToken(jwtToken);
      store.dispatch({
        type: SET_Current_User,
        payload: decodedJWT
      } as UnknownAction);
    } catch (err) {
      // Token is malformed or invalid - clear it and redirect
      localStorage.removeItem("jwtToken");
      setJWTToken(false);
      window.location.href = "/login";
    }
  }
}

export default localStorageValidate;
