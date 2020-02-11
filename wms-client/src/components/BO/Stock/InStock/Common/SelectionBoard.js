import React, { Component } from "react";
import CheckBoxForSelectionBoard from "./CheckBoxForSelectionBoard";

class SelectionBoard extends Component {
  render() {
    const { orderNo, waitHandleStatus, selectedProductNoList } = this.props;
    const filterSelectedList = selectedProductNoList.filter(
      object => object.selected === true
    );

    return (
      <div>
        <div className="row justify-content-between">
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.props.handlePrevStep}
          >
            上一步
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.props.handleNextStep}
            disabled={filterSelectedList.length === 0}
          >
            下一步
          </button>
        </div>
        <p className="h5 text-center">{this.props.type + "單號: " + orderNo}</p>
        <p className="h5 text-center">含有以下貨號，請選擇此次欲入庫貨號</p>
        <hr />
        <div className="scrollbar-65">
          <div className="container">
            <div className="row">
              {selectedProductNoList.map((object, index) => (
                <CheckBoxForSelectionBoard
                  key={index}
                  index={object.index}
                  productNo={object.productNo}
                  checked={object.selected}
                  waitHandleStatus={waitHandleStatus[object.productNo]}
                  handleCheckBoxSelected={this.props.handleCheckBoxSelected}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SelectionBoard;
