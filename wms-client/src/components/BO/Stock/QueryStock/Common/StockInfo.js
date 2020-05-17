import React, { Component } from "react";

class StockInfo extends Component {
  render() {
    const { typeValidation, stockInfo } = this.props;
    const { stockIdentifier } = this.props.stockInfo;

    return (
      <tr className={stockIdentifier.waitToShrink ? "table-warning" : ""}>
        <td>{stockIdentifier.productNo}</td>
        <td>{stockIdentifier.lotNo}</td>
        <td>{stockIdentifier.type}</td>
        <td>{stockIdentifier.quantity}</td>
        <td>{stockIdentifier.unit}</td>
        {typeValidation ? null : (
          <React.Fragment>
            <td>{stockInfo.color}</td>
            <td>{stockInfo.defect}</td>
          </React.Fragment>
        )}
        <td>{stockInfo.remark}</td>
        <td>{stockIdentifier.firstInStockAt}</td>
      </tr>
    );
  }
}

export default StockInfo;
