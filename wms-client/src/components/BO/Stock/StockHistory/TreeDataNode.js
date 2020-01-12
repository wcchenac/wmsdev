import React, { Component } from "react";

class TreeDataNode extends Component {
  render() {
    const { stockIdentifier } = this.props;

    return (
      <div>
        <div
          style={
            stockIdentifier.exist
              ? {
                  backgroundColor: "palegreen",
                  display: "inline-block",
                  borderRadius: 10,
                  color: "black",
                  padding: "0px 5px"
                }
              : {
                  backgroundColor: "lightgray",
                  display: "inline-block",
                  borderRadius: 10,
                  color: "black",
                  padding: "0px 5px"
                }
          }
        >
          <p className="mb-0">
            貨號/批號: {stockIdentifier.productNo}/{stockIdentifier.lotNo},
            型態: {stockIdentifier.type}, 數量/單位: {stockIdentifier.quantity}
            {stockIdentifier.unit}, 首次入庫日期:{" "}
            {stockIdentifier.firstInStockAt}
          </p>
          {stockIdentifier.exist ? null : (
            <p className="mb-0">
              出庫日期: {stockIdentifier.eliminateDate}, 出庫原因:{" "}
              {stockIdentifier.eliminateReason}
              {stockIdentifier.eliminateType === "1" &&
              stockIdentifier.adjustment !== null
                ? ", 短溢數量/單位: " +
                  stockIdentifier.adjustment +
                  stockIdentifier.unit
                : null}
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default TreeDataNode;
