import React, { Component } from "react";
import StockInfo from "./StockInfo";

class StockInfoContainer extends Component {
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
                  <th style={{ width: "10%" }}>
                    <div className="pl-1">批號</div>
                  </th>
                  <th style={{ width: "12.5%" }}>
                    <div className="pl-2">型態</div>
                  </th>
                  <th style={{ width: "12.5%" }}>
                    <div className="pl-2">數量</div>
                  </th>
                  <th style={{ width: "10%" }}>
                    <div className="pl-2">單位</div>
                  </th>
                  <th style={{ width: "13%" }}>
                    <div className="pl-2">進貨日期</div>
                  </th>
                  <th style={{ width: "22%" }} />
                </React.Fragment>
              ) : (
                <React.Fragment>
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
                    <div className="pl-1">數量</div>
                  </th>
                  <th style={{ width: "6%" }}>
                    <div className="pl-1">單位</div>
                  </th>
                  <th style={{ width: "6%" }}>色號</th>
                  <th style={{ width: "9%" }}>
                    <div className="pl-2">瑕疵</div>
                  </th>
                  <th style={{ width: "13%" }}>
                    <div className="pl-2">進貨日期</div>
                  </th>
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
