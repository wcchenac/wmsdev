import React, { Component } from "react";
import ModifyRequestContainer from "./ModifyRequestContainer";
import { copy } from "../../../../../utilities/DeepCopy";
import {
  updateStockInfoesCopy,
  joinInfoesDefectArray,
  defectStringTransToOptions
} from "../../Utilities/StockInfoHelperMethods";

const equal = require("fast-deep-equal");

class ModifyRequestBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldStockInfo: this.props.stockInfo,
      newStockInfoes: [],
      typeValidation: this.props.stockInfo.stockIdentifier.type === "雜項"
    };
    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleNewDataClick = this.handleNewDataClick.bind(this);
    this.handleDeleteDataClick = this.handleDeleteDataClick.bind(this);
    this.handleRequestChange = this.handleRequestChange.bind(this);
    this.handleDefectChange = this.handleDefectChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  handleBackClick() {
    this.props.handleGoBack();
  }

  modifyRequestInitialContent(typeExchange, sameTypeModify, hardwareModify) {
    let initialContent = {
      productNo: this.state.oldStockInfo.stockIdentifier.productNo,
      lotNo: this.state.oldStockInfo.stockIdentifier.lotNo,
      quantity: "",
      unit: this.state.oldStockInfo.stockIdentifier.unit,
      color: this.state.oldStockInfo.color,
      defect: defectStringTransToOptions(
        this.state.oldStockInfo.stockIdentifier.defect
      ),
      record: "",
      remark: "",
      inStockType: "shrink",
      parentId: this.state.oldStockInfo.stockIdentifier.id, // for history use
      errors: {
        quantity: ""
      }
    };
    if (typeExchange) {
      initialContent["type"] = "板卷";
    }
    if (sameTypeModify) {
      initialContent["type"] = "整支";
    }
    if (hardwareModify) {
      initialContent["type"] = "雜項";
    }

    return initialContent;
  }

  infoLengthCalculation() {
    // 閉包函數 十進位近似值
    // cite from https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Math/round
    (function() {
      /**
       * Decimal adjustment of a number.
       *
       * @param {String}  type  The type of adjustment.
       * @param {Number}  value The number.
       * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
       * @returns {Number} The adjusted value.
       */
      function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === "undefined" || +exp === 0) {
          return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
          return NaN;
        }
        // Shift
        value = value.toString().split("e");
        value = Math[type](
          +(value[0] + "e" + (value[1] ? +value[1] - exp : -exp))
        );
        // Shift back
        value = value.toString().split("e");
        return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
      }

      // Decimal round
      if (!Math.round10) {
        Math.round10 = function(value, exp) {
          return decimalAdjust("round", value, exp);
        };
      }
      // Decimal floor
      if (!Math.floor10) {
        Math.floor10 = function(value, exp) {
          return decimalAdjust("floor", value, exp);
        };
      }
      // Decimal ceil
      if (!Math.ceil10) {
        Math.ceil10 = function(value, exp) {
          return decimalAdjust("ceil", value, exp);
        };
      }
    })();

    const { oldStockInfo, newStockInfoes } = this.state;
    let oldTotalLength = parseFloat(oldStockInfo.stockIdentifier.quantity);
    let oldType = oldStockInfo.stockIdentifier.type;
    let typeDifference = false;
    let totalQuantity = 0;
    let allocation = 0;

    for (let i = 0; i < newStockInfoes.length; i += 1) {
      let childQuantity = parseFloat(newStockInfoes[i].quantity);
      totalQuantity += childQuantity;

      // allcation occurs when "整支" change to "板卷"
      if (equal(oldType, "整支") && equal(newStockInfoes[i].type, "板卷")) {
        allocation += childQuantity;
        typeDifference = true;
      }
    }

    let adjustment = totalQuantity - oldTotalLength;

    return typeDifference
      ? {
          adjustment: Math.round10(adjustment, -1),
          totalQuantity: totalQuantity,
          allocation: Math.round10(allocation - adjustment, -1)
        }
      : {
          adjustment: Math.round10(adjustment, -1),
          totalQuantity: totalQuantity,
          allocation: 0
        };
  }

  handleNewDataClick() {
    const { typeExchange, sameTypeModify, hardwareModify } = this.props;
    const { newStockInfoes } = this.state;
    let newStockInfo;

    if (newStockInfoes.length === 0) {
      newStockInfo = this.modifyRequestInitialContent(
        typeExchange,
        sameTypeModify,
        hardwareModify
      );
    } else {
      newStockInfo = {
        productNo: this.state.oldStockInfo.stockIdentifier.productNo,
        lotNo: this.state.oldStockInfo.stockIdentifier.lotNo,
        type: newStockInfoes[newStockInfoes.length - 1].type,
        quantity: "",
        unit: newStockInfoes[newStockInfoes.length - 1].unit,
        color: newStockInfoes[newStockInfoes.length - 1].color,
        defect: newStockInfoes[newStockInfoes.length - 1].defect,
        record: this.state.oldStockInfo.record,
        remark: "",
        inStockType: "shrink",
        parentId: this.state.oldStockInfo.stockIdentifier.id, // for history use
        errors: {
          quantity: ""
        }
      };
    }

    this.setState({
      newStockInfoes: [...this.state.newStockInfoes, newStockInfo]
    });
  }

  handleDeleteDataClick() {
    let stockInfoesCopy = [...this.state.newStockInfoes];

    stockInfoesCopy.splice(stockInfoesCopy.length - 1, 1);

    this.setState({
      newStockInfoes: stockInfoesCopy
    });
  }

  handleRequestChange(request, i) {
    let newStockInfoesCopy = copy(this.state.newStockInfoes);
    const { name, value } = request.target;

    updateStockInfoesCopy(newStockInfoesCopy, name, value, i);

    this.setState({ newStockInfoes: newStockInfoesCopy });
  }

  handleDefectChange(selectedOptions, i) {
    const copyList = [...this.state.newStockInfoes];

    copyList[i].defect = selectedOptions;

    this.setState({
      newStockInfoes: copyList
    });
  }

  handleSubmitClick() {
    const { oldStockInfo, newStockInfoes, typeValidation } = this.state;
    let stockInfoesCopy = copy(newStockInfoes);
    let infoLengthCalculation = this.infoLengthCalculation();

    if (!typeValidation) {
      joinInfoesDefectArray(stockInfoesCopy);
    }

    let shrinkStockRequest = {
      oldStockIdentifierId: oldStockInfo.stockIdentifier.id,
      inStockRequests: stockInfoesCopy,
      allocation: infoLengthCalculation.allocation,
      adjustment: infoLengthCalculation.adjustment
    };

    this.props.handleModifyRequestSubmit(shrinkStockRequest);
  }

  modalContent() {
    let infoLengthCalculation = this.infoLengthCalculation();

    if (infoLengthCalculation.adjustment === 0) {
      return (
        <React.Fragment>
          <p>減肥前後總數量相符，是否確認送出？</p>
        </React.Fragment>
      );
    } else if (
      Math.abs(infoLengthCalculation.adjustment) >
      infoLengthCalculation.totalQuantity * 0.03
    ) {
      return (
        <React.Fragment>
          <p>
            減肥前後總數量不符，且差異量大於平常值(差異量：
            {infoLengthCalculation.adjustment} 碼)，是否確認送出？
          </p>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <p>
            減肥前後總數量不符，差異量： {infoLengthCalculation.adjustment}{" "}
            碼，是否確認送出？
          </p>
        </React.Fragment>
      );
    }
  }

  checkLengthAlgorithm(stockInfoes) {
    var isLengthChecked = false;

    for (let i = 0; i < stockInfoes.length; i += 1) {
      if (
        stockInfoes[i].errors.quantity === "" &&
        stockInfoes[i].quantity > 0
      ) {
        isLengthChecked = true;
      } else {
        isLengthChecked = false;
        break;
      }
    }

    return isLengthChecked;
  }

  render() {
    const { oldStockInfo, newStockInfoes, typeValidation } = this.state;
    let isLengthChecked = this.checkLengthAlgorithm(newStockInfoes);
    let modalContent = this.modalContent();

    return (
      <div className="stock_info">
        <div className="container">
          <button
            type="button"
            onClick={this.handleBackClick}
            className="btn btn-secondary"
          >
            返回
          </button>
          <p className="h3 text-center">異動前狀態</p>
          <hr />
          <table className="table">
            <thead className="thead-dark">
              <tr>
                <th scope="col">貨號</th>
                <th scope="col">批號</th>
                <th scope="col">型態</th>
                <th scope="col">數量</th>
                <th scope="col">單位</th>
                <th scope="col">記錄</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="productNo"
                      value={oldStockInfo.stockIdentifier.productNo}
                      disabled
                    />
                  </div>
                </td>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="lotNo"
                      value={oldStockInfo.stockIdentifier.lotNo}
                      disabled
                    />
                  </div>
                </td>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="type"
                      value={oldStockInfo.stockIdentifier.type}
                      disabled
                    />
                  </div>
                </td>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="quantity"
                      value={oldStockInfo.stockIdentifier.quantity}
                      disabled
                    />
                  </div>
                </td>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="unit"
                      value={oldStockInfo.stockIdentifier.unit}
                      disabled
                    />
                  </div>
                </td>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="record"
                      value={oldStockInfo.record}
                      disabled
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="row">
            <div className="col-md-auto mr-auto">
              <button
                type="button"
                className="btn btn-primary mr-2 "
                onClick={this.handleNewDataClick}
              >
                新增資料
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleDeleteDataClick}
                disabled={newStockInfoes.length === 0}
              >
                刪除資料
              </button>
            </div>
            <div className="col-md-auto">
              <button
                type="button"
                className="btn btn-primary btn-block"
                disabled={!isLengthChecked}
                data-toggle="modal"
                data-target="#warn_info"
              >
                送出
              </button>
              <div
                className="modal fade"
                id="warn_info"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="content"
                aria-hidden="true"
              >
                <div
                  className="modal-dialog modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">減肥確認</h5>
                      <button
                        type="button"
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">{modalContent}</div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-dismiss="modal"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        data-dismiss="modal"
                        onClick={this.handleSubmitClick}
                      >
                        送出
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br />
          {newStockInfoes.length === 0 ? (
            <div className="alert alert-warning text-center" role="alert">
              請新增資料
            </div>
          ) : (
            <ModifyRequestContainer
              typeValidation={typeValidation}
              newStockInfoes={newStockInfoes}
              onRequestChange={this.handleRequestChange}
              handleDefectChange={this.handleDefectChange}
            />
          )}
          <hr />
        </div>
      </div>
    );
  }
}

export default ModifyRequestBoard;
