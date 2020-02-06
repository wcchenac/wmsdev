// import axios from "axios";
import API from "./API";

const setJWTToken = token => {
  if (token) {
    API.defaults.headers.common["Authorization"] = token;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

export default setJWTToken;
