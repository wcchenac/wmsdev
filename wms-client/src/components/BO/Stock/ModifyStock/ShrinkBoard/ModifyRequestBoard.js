import React, { Component } from "react";
import { StockIdentifierType, ShrinkType } from "../../../../../enums/Enums";
import ModifyRequestContainer from "./ModifyRequestContainer";
import { copy } from "../../../../../utilities/DeepCopy";
import {
  updateStockInfoesCopy,
  joinInfoesDefectArray,
  defectStringTransToOptions
} from "../../Utilities/StockInfoHelperMethods";
import ToolbarForAddDeleteSubmit from "../../Utilities/ToolbarForAddDeleteSubmit";
import ShrinkConfirmModal from "./ShrinkConfirmModal";

const equal = require("fast-deep-equal");

class ModifyRequestBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalShow: false,
      oldStockInfo: this.props.stockInfo,
      newStockInfoes: [],
      typeValidation:
        this.props.stockInfo.stockIdentifier.type ===
        StockIdentifierType.hardware,
      assignRowNum: 0
    };
    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleNewDataClick = this.handleNewDataClick.bind(this);
    this.handleDeleteDataClick = this.handleDeleteDataClick.bind(this);
    this.handleRequestChange = this.handleRequestChange.bind(this);
    this.handleDefectChange = this.handleDefectChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleShipCheck = this.handleShipCheck.bind(this);
    this.handleReasonButton = this.handleReasonButton.bind(this);
    this.handleRowNumChange = this.handleRowNumChange.bind(this);
    this.handleRowNumSubmit = this.handleRowNumSubmit.bind(this);
  }

  handleBackClick() {
    this.props.handleGoBack();
  }

  modifyRequestInitialContent() {
    const { typeExchange, sameTypeModify, hardwareModify } = this.props;
    let initialContent = {
      productNo: this.state.oldStockInfo.stockIdentifier.productNo,
      lotNo: this.state.oldStockInfo.stockIdentifier.lotNo,
      quantity: "",
      unit: this.state.oldStockInfo.stockIdentifier.unit,
      color: this.state.oldStockInfo.color,
      defect: defectStringTransToOptions(this.state.oldStockInfo.defect),
      record: "",
      remark: "",
      inStockType: "shrink",
      directShip: false,
      outStockReason: "",
      parentId: this.state.oldStockInfo.stockIdentifier.id, // for history use
      errors: {
        quantity: ""
      }
    };
    if (typeExchange) {
      initialContent["type"] = StockIdentifierType.board;
    }
    if (sameTypeModify) {
      initialContent["type"] = StockIdentifierType.roll;
    }
    if (hardwareModify) {
      initialContent["type"] = StockIdentifierType.hardware;
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

      // allocation occurs when newType not equals to oldType
      if (!equal(oldType, newStockInfoes[i].type)) {
        allocation += childQuantity;
        typeDifference = true;
      }
    }

    let adjustment = totalQuantity - oldTotalLength;

    let result = {
      adjustment: Math.round10(adjustment, -1),
      totalQuantity: totalQuantity
    };

    if (typeDifference) {
      result["allocation"] = Math.round10(allocation, -1);

      if (oldType === StockIdentifierType.board) {
        result["shrinkType"] = ShrinkType.BtoR;
      }
      if (oldType === StockIdentifierType.roll) {
        result["shrinkType"] = ShrinkType.RtoB;
      }
    } else {
      result["allocation"] = 0;

      if (oldType === StockIdentifierType.board) {
        result["shrinkType"] = ShrinkType.BtoB;
      }
      if (oldType === StockIdentifierType.roll) {
        result["shrinkType"] = ShrinkType.RtoR;
      }
      if (oldType === StockIdentifierType.hardware) {
        result["shrinkType"] = ShrinkType.HtoH;
      }
    }

    return result;
  }

  handleModalClose() {
    this.setState({ modalShow: false });
  }

  handleModalShow() {
    this.setState({ modalShow: true });
  }

  handleNewDataClick() {
    const { newStockInfoes } = this.state;
    let newStockInfo;

    if (newStockInfoes.length === 0) {
      newStockInfo = this.modifyRequestInitialContent();
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
        directShip: false,
        outStockReason: "",
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

  handleSubmitClick(infoLengthCalculation) {
    const { oldStockInfo, newStockInfoes, typeValidation } = this.state;
    let stockInfoesCopy = copy(newStockInfoes);

    if (!typeValidation) {
      joinInfoesDefectArray(stockInfoesCopy);
    }

    let shrinkStockRequest = {
      oldStockIdentifierId: oldStockInfo.stockIdentifier.id,
      inStockRequests: stockInfoesCopy,
      allocation: infoLengthCalculation.allocation,
      adjustment: infoLengthCalculation.adjustment,
      shrinkType: infoLengthCalculation.shrinkType
    };

    this.props.handleModifyRequestSubmit(shrinkStockRequest);
    this.handleModalClose();
  }

  handleRowNumChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleRowNumSubmit(e) {
    e.preventDefault();

    const stockInfoesCopy = [...this.state.newStockInfoes];
    const { newStockInfoes } = this.state;
    let newStockInfo;

    if (newStockInfoes.length === 0) {
      newStockInfo = this.modifyRequestInitialContent();
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
        directShip: false,
        outStockReason: "",
        parentId: this.state.oldStockInfo.stockIdentifier.id, // for history use
        errors: {
          quantity: ""
        }
      };
    }

    for (let i = 0; i < this.state.assignRowNum; i += 1) {
      stockInfoesCopy.push(newStockInfo);
    }

    this.setState({ assignRowNum: 0, newStockInfoes: stockInfoesCopy });
  }

  handleShipCheck(checked, i) {
    const copyList = [...this.state.newStockInfoes];

    copyList[i].directShip = checked;

    if (!checked) {
      copyList[i].outStockReason = "";
    }

    this.setState({
      newStockInfoes: copyList
    });
  }

  handleReasonButton(value, i) {
    const copyList = [...this.state.newStockInfoes];

    copyList[i].outStockReason = value;

    this.setState({
      newStockInfoes: copyList
    });
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
    const {
      modalShow,
      oldStockInfo,
      newStockInfoes,
      typeValidation,
      assignRowNum
    } = this.state;
    let isLengthChecked = this.checkLengthAlgorithm(newStockInfoes);
    let infoLengthCalculation = modalShow ? this.infoLengthCalculation() : null;

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
          <ToolbarForAddDeleteSubmit
            onAddClick={this.handleNewDataClick}
            onDeleteClick={this.handleDeleteDataClick}
            onSubmitClick={this.handleModalShow}
            handleRowNumChange={this.handleRowNumChange}
            handleRowNumSubmit={this.handleRowNumSubmit}
            deleteDisabled={newStockInfoes.length === 0}
            submitDisabled={!isLengthChecked}
            assignRowNum={assignRowNum}
          />
          {newStockInfoes.length === 0 ? (
            <div className="alert alert-warning text-center" role="alert">
              請新增資料
            </div>
          ) : (
            <div>
              <ModifyRequestContainer
                typeValidation={typeValidation}
                newStockInfoes={newStockInfoes}
                onRequestChange={this.handleRequestChange}
                handleDefectChange={this.handleDefectChange}
                handleShipCheck={this.handleShipCheck}
                handleReasonButton={this.handleReasonButton}
              />
              {modalShow ? (
                <ShrinkConfirmModal
                  show
                  infoLengthCalculation={infoLengthCalculation}
                  handleModalClose={this.handleModalClose}
                  handleSubmitClick={this.handleSubmitClick}
                />
              ) : null}
            </div>
          )}
          <hr />
        </div>
      </div>
    );
  }
}

export default ModifyRequestBoard;
