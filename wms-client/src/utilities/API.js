import axios from "axios";

export default axios.create({
  baseURL: "http://192.168.2.154:8080",
  responseEncoding: "utf8"
});
