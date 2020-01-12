import React, { Component } from "react";
import ShrinkInfo from "./ShrinkInfo";

class ShrinkInfoContainer extends Component {
  render() {
    const { shrinkList } = this.props;

    if (shrinkList.length === 0) {
      return (
        <div className="alert alert-warning text-center" role="alert">
          查無資料
        </div>
      );
    } else {
      return (
        <div className="table-wrapper-scroll-y scrollbar-75">
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "18%" }}>
                  <div className="pl-3">貨號</div>
                </th>
                <th style={{ width: "8%" }}>
                  <div className="pl-1">批號</div>
                </th>
                <th style={{ width: "8%" }}>
                  {" "}
                  <div className="pl-2">型態</div>
                </th>
                <th style={{ width: "9%" }}>
                  {" "}
                  <div className="pl-1">數量</div>
                </th>
                <th style={{ width: "8%" }}>
                  {" "}
                  <div className="pl-1">單位</div>
                </th>
                <th style={{ width: "7.5%" }}>色號</th>
                <th style={{ width: "9%" }}>
                  {" "}
                  <div className="pl-2">瑕疵</div>
                </th>
                <th style={{ width: "10.5%" }} />
                <th style={{ width: "10.5%" }} />
                <th style={{ width: "10.5%" }} />
              </tr>
            </thead>
            <tbody>
              {shrinkList.map((stockInfo, index) => (
                <ShrinkInfo
                  key={index}
                  stockInfo={stockInfo}
                  onModifyClick={this.props.onModifyClick}
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
