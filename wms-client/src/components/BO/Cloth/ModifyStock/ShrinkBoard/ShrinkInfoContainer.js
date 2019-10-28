import React, { Component } from "react";
import ShrinkInfo from "./ShrinkInfo";

class ShrinkInfoContainer extends Component {
  render() {
    const { shrinkList } = this.props;

    if (shrinkList === null || shrinkList.length < 1) {
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
                <th style={{ width: "18%" }}>貨號</th>
                <th style={{ width: "8%" }}>批號</th>
                <th style={{ width: "8%" }}>型態</th>
                <th style={{ width: "9%" }}>長度</th>
                <th style={{ width: "8%" }}>單位</th>
                <th style={{ width: "7.5%" }}>色號</th>
                <th style={{ width: "9%" }}>瑕疵</th>
                <th style={{ width: "10.5%" }} />
                <th style={{ width: "10.5%" }} />
                <th style={{ width: "10.5%" }} />
              </tr>
            </thead>
            <tbody>
              {shrinkList.map((clothInfo, index) => (
                <ShrinkInfo
                  key={index}
                  clothInfo={clothInfo}
                  onTypeExchangeClick={this.props.onTypeExchangeClick}
                  onSameTypeClick={this.props.onSameTypeClick}
                  onCancelShrinkClick={this.props.onCancelShrinkClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}

export default ShrinkInfoContainer;
