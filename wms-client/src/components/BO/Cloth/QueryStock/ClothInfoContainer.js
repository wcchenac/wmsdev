import React, { Component } from "react";
import ClothInfo from "./ClothInfo";

class ClothInfoContainer extends Component {
  boardAlgorithm(clothInfoes) {
    if (clothInfoes === null || clothInfoes.length < 1) {
      return (
        <div className="alert alert-warning text-center" role="alert">
          查無資料
        </div>
      );
    } else {
      return (
        <div className="table-wrapper-scroll-y my-custom-scrollbar">
          <table className="table table-sm table-hover">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "20%" }}>貨號</th>
                <th style={{ width: "10%" }}>批號</th>
                <th style={{ width: "10%" }}>型態</th>
                <th style={{ width: "10%" }}>長度</th>
                <th style={{ width: "10%" }}>單位</th>
                <th style={{ width: "10%" }}>色號</th>
                <th style={{ width: "15%" }}>瑕疵</th>
                <th style={{ width: "15%" }}>進貨日期</th>
              </tr>
            </thead>
            <tbody>
              {clothInfoes.map(clothInfo => (
                <ClothInfo key={clothInfo.id} clothInfo={clothInfo} />
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  render() {
    const { clothInfoes } = this.props;
    let BoardContent = this.boardAlgorithm(clothInfoes);

    return <div>{BoardContent}</div>;
  }
}

export default ClothInfoContainer;
