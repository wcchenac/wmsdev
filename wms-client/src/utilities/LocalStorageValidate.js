import setJWTToken from "./SetJWTToken";
import jwt_decode from "jwt-decode";
import store from "../store";
import { SET_Current_User } from "../actions/types";
import { logout } from "../actions/UserActions";

function localStorageValidate() {
  const jwtToken = localStorage.getItem("jwtToken");

  if (jwtToken) {
    setJWTToken(jwtToken);

    const decodedJWT = jwt_decode(jwtToken);

    store.dispatch({
      type: SET_Current_User,
      payload: decodedJWT
    });

    const currentTime = Date.now() / 1000;
    if (decodedJWT.exp < currentTime) {
      store.dispatch(logout());
      window.location.href = "/";
    }
  }
}

export default localStorageValidate;
