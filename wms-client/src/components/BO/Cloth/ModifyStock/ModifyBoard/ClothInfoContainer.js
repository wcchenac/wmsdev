import React, { Component } from "react";
import ClothInfo from "./ClothInfo";

class ClothInfoContainer extends Component {
  render() {
    const { clothInfoes } = this.props;

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
                <th style={{ width: "20%" }}>
                  <div className="pl-3">貨號</div>
                </th>
                <th style={{ width: "8%" }}>
                  <div className="pl-1">批號</div>
                </th>
                <th style={{ width: "8%" }}>
                  <div className="pl-2">型態</div>
                </th>
                <th style={{ width: "8%" }}>
                  <div className="pl-1">長度</div>
                </th>
                <th style={{ width: "6%" }}>
                  <div className="pl-1">單位</div>
                </th>
                <th style={{ width: "6%" }}>色號</th>
                <th style={{ width: "9%" }}>
                  <div className="pl-2">瑕疵</div>
                </th>
                <th style={{ width: "13%" }}>進貨日期</th>
                <th style={{ width: "22%" }} />
              </tr>
            </thead>
            <tbody>
              {clothInfoes.map((clothInfo, index) => (
                <ClothInfo
                  key={index}
                  index={index}
                  clothInfo={clothInfo}
                  handleShip={this.props.handleShip}
                  handleShrink={this.props.handleShrink}
                  handleClothInfoUpdate={this.props.handleClothInfoUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}

export default ClothInfoContainer;
