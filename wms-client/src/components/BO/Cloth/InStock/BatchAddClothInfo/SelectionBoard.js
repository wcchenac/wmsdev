import React, { Component } from "react";
import CheckBox from "./CheckBox";
import { isEmpty } from "../../../../../utilities/IsEmpty";

class SelectionBoard extends Component {
  render() {
    const {
      inStockOrderNo,
      waitHandleStatus,
      selectedProductNoList
    } = this.props;
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
        {isEmpty(waitHandleStatus) ? (
          <div className="alert alert-warning text-center" role="alert">
            查無進貨單({inStockOrderNo})資料 或 進貨單內沒有需要入庫的貨號
          </div>
        ) : (
          <React.Fragment>
            <p className="h5 text-center">進貨單單號: {inStockOrderNo}</p>
            <p className="h5 text-center">含有以下貨號，請選擇此次欲入庫貨號</p>
            <hr />
            <div className="col-md-12">
              <div className="row">
                {selectedProductNoList.map((object, index) => (
                  <CheckBox
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
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default SelectionBoard;
