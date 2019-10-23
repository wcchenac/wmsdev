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
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "20%" }}>貨號</th>
                <th style={{ width: "9%" }}>批號</th>
                <th style={{ width: "9%" }}>型態</th>
                <th style={{ width: "10%" }}>長度</th>
                <th style={{ width: "8%" }}>單位</th>
                <th style={{ width: "8%" }}>色號</th>
                <th style={{ width: "9%" }}>瑕疵</th>
                <th style={{ width: "27%" }} />
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
