import axios from "axios";

export default axios.create({
  baseURL: "http://192.168.20.113:8080",
  responseEncoding: "utf8"
});
