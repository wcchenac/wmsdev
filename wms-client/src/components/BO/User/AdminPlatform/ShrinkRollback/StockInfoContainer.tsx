import React, { Component } from "react";
import StockInfo from "./StockInfo";

import type { ShrinkHistoryNode } from "./StockInfo";

interface Props {
  result: ShrinkHistoryNode[];
  handleShrinkRollback: (stockIdentifierId: number) => void;
}

interface State {}


class StockInfoContainer extends Component<Props, State> {
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
