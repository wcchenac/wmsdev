import API from "./API";

const setJWTToken = (token: string | false): void => {
  const commonHeaders = API.defaults?.headers?.common;
  if (!commonHeaders) {
    return;
  }
  if (token) {
    commonHeaders["Authorization"] = token;
  } else {
    delete commonHeaders["Authorization"];
  }
};

export default setJWTToken;
