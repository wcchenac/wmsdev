import React, { Component } from "react";
import StockInfo from "./StockInfo";

class StockInfoContainer extends Component {
  render() {
    return (
      <div className="table-wrapper-scroll-y scrollbar-70">
        <table className="table table-sm table-hover">
          <thead className="thead-dark">
            <tr>
              <th style={{ width: "20%" }}>
                <div className="pl-3">貨號</div>
              </th>
              <th style={{ width: "10%" }}>
                <div className="pl-2">批號</div>
              </th>
              <th style={{ width: "10%" }}>
                <div className="pl-2">型態</div>
              </th>
              <th style={{ width: "20%" }}>
                <div className="pl-2">數量/單位</div>
              </th>
              <th style={{ width: "20%" }}>
                <div className="pl-2">減肥日期</div>
              </th>
              <th style={{ width: "20%" }}></th>
            </tr>
          </thead>
          <tbody>
            {this.props.result.map((object, index) => (
              <StockInfo
                object={object}
                key={index}
                handleShrinkRollback={this.props.handleShrinkRollback}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default StockInfoContainer;
