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
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "225px" }}>貨號</th>
                <th style={{ width: "150px" }}>批號</th>
                <th style={{ width: "150px" }}>型態</th>
                <th style={{ width: "150px" }}>長度</th>
                <th style={{ width: "145px" }}>單位</th>
                <th style={{ width: "145px" }}>色號</th>
                <th style={{ width: "145px" }}>瑕疵</th>
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
