import React, { Component } from "react";
import OutStockRequestContainer from "./OutStockRequestContainer";

class OutStockBoard extends Component {
  constructor() {
    super();
    this.state = {
      outStockRequests: []
    };
    this.handleNewDataClick = this.handleNewDataClick.bind(this);
    this.handleDeleteDataClick = this.handleDeleteDataClick.bind(this);
    this.handleRequestChange = this.handleRequestChange.bind(this);
  }

  handleNewDataClick() {
    const outStockRequest = {
      productNo: "",
      type: "整支",
      length: "",
      unit: "碼",
      user: "",
      errors: {
        length: ""
      }
    };

    this.setState({
      outStockRequests: [...this.state.outStockRequests, outStockRequest]
    });
  }

  handleDeleteDataClick() {
    const { outStockRequests } = this.state;

    outStockRequests.splice(outStockRequests.length - 1, 1);

    this.setState({
      outStockRequests: outStockRequests
    });
  }

  handleRequestChange(request, i) {
    let outStockRequestsCopy = JSON.parse(
      JSON.stringify(this.state.outStockRequests)
    );
    const { name, value } = request.target;

    switch (name) {
      case "productNo":
        outStockRequestsCopy[i].productNo = value;
        break;
      case "type":
        outStockRequestsCopy[i].type = value;
        break;
      case "length":
        outStockRequestsCopy[i].errors.length = /^\d*\.?\d+$/.test(value)
          ? ""
          : "請輸入純數字或數量不可空白";
        outStockRequestsCopy[i].length = value;
        break;
      case "unit":
        outStockRequestsCopy[i].unit = value;
        break;
      default:
        break;
    }

    this.setState({ outStockRequests: outStockRequestsCopy });
  }

  checkLengthAlgorithm(outStockRequests) {
    var isLengthChecked = false;

    for (let i = 0; i < outStockRequests.length; i += 1) {
      if (outStockRequests[i].errors === "" || outStockRequests[i].length > 0) {
        isLengthChecked = true;
      } else {
        isLengthChecked = false;
        break;
      }
    }

    return isLengthChecked;
  }

  render() {
    const { outStockRequests } = this.state;
    let isLengthChecked = this.checkLengthAlgorithm(outStockRequests);

    return (
      <div className="outStock_board">
        <div className="container">
          <p className="h3 text-center">申請拉貨</p>
          <hr />
          <div className="row">
            <div className="col-md-auto">
              <div
                className="btn-toolbar"
                role="toolbar"
                aria-label="Toolbar with button groups"
              >
                <div
                  className="btn-group mr-2"
                  role="group"
                  aria-label="First group"
                >
                  <button
                    tyep="button"
                    className="btn btn-primary"
                    onClick={this.handleNewDataClick}
                  >
                    新增資料
                  </button>
                </div>
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Second group"
                >
                  <button
                    tyep="button"
                    className="btn btn-primary"
                    onClick={this.handleDeleteDataClick}
                    disabled={outStockRequests.length === 0}
                  >
                    刪除資料
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-auto  ml-auto">
              <div
                className="btn-toolbar"
                role="toolbar"
                aria-label="Toolbar with button groups"
              >
                <div
                  className="btn-group mr-2"
                  role="group"
                  aria-label="First group"
                >
                  <button
                    tyep="button"
                    className="btn btn-primary"
                    disabled={!isLengthChecked}
                  >
                    儲存至明細
                  </button>
                </div>
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Second group"
                >
                  <button
                    tyep="button"
                    className="btn btn-primary"
                    disabled={!isLengthChecked}
                  >
                    直接匯出
                  </button>
                </div>
              </div>
            </div>
          </div>
          <OutStockRequestContainer
            outStockRequests={outStockRequests}
            handleRequestChange={this.handleRequestChange}
          />
          <hr />
        </div>
      </div>
    );
  }
}

export default OutStockBoard;
