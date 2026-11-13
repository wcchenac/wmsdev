import React, { Component } from "react";
import StockInfo from "./StockInfo";

import type { StoredStockInfo } from "../../../../../types/domain";

interface ShipRequest {
  stockIdentifierId: number;
  reason: string;
}

interface Props {
  typeValidation: boolean;
  stockInfoes: StoredStockInfo[];
  handleShip: (request: ShipRequest) => void;
  handleShrink: (stockIdentifierId: number) => void;
  handleStockInfoUpdate: (request: {
    id?: number;
    color?: string | number;
    defect?: string;
    record?: string;
    remark?: string;
  }) => void;
}


class StockInfoContainer extends Component<Props> {
  render() {
    const { typeValidation, stockInfoes } = this.props;

    return (
      <div className="table-wrapper-scroll-y scrollbar-70">
        <table className="table table-sm table-hover">
          <thead className="thead-dark">
            <tr>
              {typeValidation ? (
                <React.Fragment>
                  <th style={{ width: "20%" }}>
                    <div className="pl-3">貨號</div>
                  </th>
                  <th style={{ width: "8%" }}>
                    <div className="pl-1">批號</div>
                  </th>
                  <th style={{ width: "10%" }}>
                    <div className="pl-2">型態</div>
                  </th>
                  <th style={{ width: "10%" }}>
                    <div className="pl-2">數量/單位</div>
                  </th>
                  <th style={{ width: "15%" }}>
                    <div className="pl-2">進貨日期</div>
                  </th>
                  <th style={{ width: "15%" }}>註解</th>
                  <th style={{ width: "22%" }} />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <th style={{ width: "15%" }}>
                    <div className="pl-3">貨號</div>
                  </th>
                  <th style={{ width: "8%" }}>
                    <div className="pl-1">批號</div>
                  </th>
                  <th style={{ width: "7%" }}>
                    <div className="pl-2">型態</div>
                  </th>
                  <th style={{ width: "10%" }}>
                    <div className="pl-1">數量/單位</div>
                  </th>
                  <th style={{ width: "5%" }}>色號</th>
                  <th style={{ width: "8%" }}>
                    <div className="pl-2">瑕疵</div>
                  </th>
                  <th style={{ width: "12%" }}>
                    <div className="pl-2">進貨日期</div>
                  </th>
                  <th style={{ width: "13%" }}>註解</th>
                  <th style={{ width: "22%" }} />
                </React.Fragment>
              )}
            </tr>
          </thead>
          <tbody>
            {stockInfoes.map((stockInfo, index) => (
              <StockInfo
                key={index}
                index={index}
                typeValidation={typeValidation}
                stockInfo={stockInfo}
                handleShip={this.props.handleShip}
                handleShrink={this.props.handleShrink}
                handleStockInfoUpdate={this.props.handleStockInfoUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default StockInfoContainer;
