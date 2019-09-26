import React, { Component } from "react";
import CheckBox from "./CheckBox";

class SelectionBoard extends Component {
  render() {
    const { inStockOrderNo, queryProductNoList } = this.props;

    return (
      <div className="container">
        <p className="h5 text-center">進貨單單號: {inStockOrderNo}</p>
        <p className="h5 text-center">含有以下貨號，請選擇此次欲入庫貨號</p>
        <hr />
        <div className="col-md-12">
          <div className="row">
            {queryProductNoList.map((productNo, index) => (
              <CheckBox
                key={index}
                index={index}
                productNo={productNo}
                handleCheckBoxSelected={this.props.handleCheckBoxSelected}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default SelectionBoard;
