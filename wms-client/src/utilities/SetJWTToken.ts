import API from "./API";

const setJWTToken = (token: string | false): void => {
  if (token) {
    API.defaults.headers.common["Authorization"] = token;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

export default setJWTToken;
