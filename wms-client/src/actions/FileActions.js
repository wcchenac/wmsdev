// import axios from "axios";
import API from "../utilities/API";

export const downloadFile = (fileCategory, filename) => {
  API.get(`api/file/download/${fileCategory}/${filename}`, {
    responseType: "blob"
  }).then(response => {
    const url = window.URL.createObjectURL(
      new Blob([response.data], {
        type: response.headers["content-type"],
        encoding: "UTF-8"
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      response.headers["content-disposition"].split("filename=")[1]
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
};

export const queryCategoryTodayFile = async fileCategory => {
  return await API.get(`/api/file/query/${fileCategory}/today`);
};

export const queryCategoryIntervalFiles = async (
  fileCategory,
  startDate,
  endDate
) => {
  return await API.get(
    `/api/file/query/${fileCategory}/interval?startDate=${startDate}&endDate=${endDate}`
  );
};

export const inStockByImportFile = async files => {
  return await API.post("api/file/import/inStockFile", files);
};
