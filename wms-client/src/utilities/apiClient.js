import axios from "axios";

// Default warehouse API client. Point REACT_APP_API_BASE_URL at another host
// when the backend is not on localhost:8080. src/utilities/API.js stays
// gitignored and is not imported, so a clean checkout can still build.
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
