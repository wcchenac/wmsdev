import React, { Component } from "react";
import StockInfo from "./StockInfo";

class StockInfoContainer extends Component {
  render() {
    const { result } = this.props;

    return (
      <div className="table-wrapper-scroll-y scrollbar-70">
        <table className="table table-sm table-hover">
          <thead className="thead-dark">
            <tr>
              <th style={{ width: "25%" }}>
                <div className="pl-3">貨號</div>
              </th>
              <th style={{ width: "25%" }}>
                <div className="pl-2">總數量/單位</div>
              </th>
              <th style={{ width: "25%" }}>
                <div className="pl-2">子項目總數</div>
              </th>
              <th style={{ width: "25%" }}></th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(result).map((object, index) => (
              <StockInfo
                productNo={object}
                list={result[object]}
                key={index}
                handleInStockRollback={this.props.handleInStockRollback}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default StockInfoContainer;
