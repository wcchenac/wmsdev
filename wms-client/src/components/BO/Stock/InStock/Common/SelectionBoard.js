import React, { Component } from "react";
import CheckBoxForSelectionBoard from "./CheckBoxForSelectionBoard";
import { Button } from "react-bootstrap";

class SelectionBoard extends Component {
  render() {
    const { orderNo, waitHandleStatus, selectedProductNoList } = this.props;
    const filterSelectedList = selectedProductNoList.filter(
      object => object.selected === true
    );

    return (
      <div>
        <div className="row justify-content-between">
          <Button variant="primary" onClick={this.props.handlePrevStep}>
            上一步
          </Button>
          <Button
            variant="primary"
            onClick={this.props.handleNextStep}
            disabled={filterSelectedList.length === 0}
          >
            下一步
          </Button>
        </div>
        <p className="h5 text-center">{this.props.type + "單號: " + orderNo}</p>
        <p className="h5 text-center">含有以下貨號，請選擇此次欲入庫貨號</p>
        <div className="row justify-content-end">
          <Button
            className="mr-2"
            variant="info"
            value="true"
            onClick={this.props.handleSelectionClick}
          >
            全選
          </Button>
          <Button
            variant="info"
            value="false"
            onClick={this.props.handleSelectionClick}
          >
            取消全選
          </Button>
        </div>
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
