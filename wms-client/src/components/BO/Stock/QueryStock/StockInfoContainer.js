import React, { Component } from "react";
import StockInfo from "./StockInfo";

class StockInfoContainer extends Component {
  render() {
    const { typeValidation, stockInfoes } = this.props;

    return (
      <div className="table-wrapper-scroll-y my-custom-scrollbar">
        <table className="table table-sm table-hover">
          <thead className="thead-dark">
            <tr>
              {typeValidation ? (
                <React.Fragment>
                  <th style={{ width: "20%" }}>貨號</th>
                  <th style={{ width: "15%" }}>批號</th>
                  <th style={{ width: "15%" }}>型態</th>
                  <th style={{ width: "15%" }}>數量</th>
                  <th style={{ width: "15%" }}>單位</th>
                  <th style={{ width: "20%" }}>進貨日期</th>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <th style={{ width: "20%" }}>貨號</th>
                  <th style={{ width: "10%" }}>批號</th>
                  <th style={{ width: "10%" }}>型態</th>
                  <th style={{ width: "10%" }}>數量</th>
                  <th style={{ width: "10%" }}>單位</th>
                  <th style={{ width: "10%" }}>色號</th>
                  <th style={{ width: "15%" }}>瑕疵</th>
                  <th style={{ width: "15%" }}>進貨日期</th>
                </React.Fragment>
              )}
            </tr>
          </thead>
          <tbody>
            {stockInfoes.map((stockInfo, index) => (
              <StockInfo
                key={index}
                typeValidation={typeValidation}
                stockInfo={stockInfo}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default StockInfoContainer;
