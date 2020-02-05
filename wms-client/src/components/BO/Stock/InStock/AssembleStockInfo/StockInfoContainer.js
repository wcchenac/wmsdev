import React, { Component } from "react";
import StockInfo from "./StockInfo";
import { copy } from "../../../../../utilities/DeepCopy";
import {
  quantityAccumulate,
  updateStockInfoesCopy,
  joinInfoesDefectArray
} from "../../Utilities/StockInfoHelperMethods";
import ToolbarForAddDeleteSubmit from "../../Utilities/ToolbarForAddDeleteSubmit";

class StockInfoContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stockInfoes: []
    };
    this.handleNewDataClick = this.handleNewDataClick.bind(this);
    this.handleDeleteDataClick = this.handleDeleteDataClick.bind(this);
    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleDefectChange = this.handleDefectChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  handleNewDataClick() {
    const { assembleOrderContent } = this.props;
    const { stockInfoes } = this.state;
    const productNo = Object.keys(assembleOrderContent).pop();
    const type = Object.keys(assembleOrderContent[productNo]).pop();
    let newStockInfo;

    if (stockInfoes.length === 0) {
      newStockInfo = {
        productNo: productNo,
        lotNo: "",
        type: type.toString(),
        quantity: "",
        unit: assembleOrderContent[productNo][type].unit,
        color: "1",
        defect: [{ label: "無", value: "無" }],
        record: "",
        remark: "",
        inStockType: "assemble",
        orderNo: this.props.assembleOrderNo,
        errors: {
          quantity: ""
        }
      };
    } else {
      newStockInfo = {
        productNo: productNo,
        lotNo: stockInfoes[stockInfoes.length - 1].lotNo,
        type: stockInfoes[stockInfoes.length - 1].type,
        quantity: "",
        unit: stockInfoes[stockInfoes.length - 1].unit,
        color: stockInfoes[stockInfoes.length - 1].color,
        defect: stockInfoes[stockInfoes.length - 1].defect,
        record: "",
        remark: "",
        inStockType: "assemble",
        orderNo: this.props.assembleOrderNo,
        errors: {
          quantity: ""
        }
      };
    }

    this.setState({
      stockInfoes: [...this.state.stockInfoes, newStockInfo]
    });
  }

  handleDeleteDataClick() {
    let stockInfoesCopy = [...this.state.stockInfoes];

    stockInfoesCopy.splice(stockInfoesCopy.length - 1, 1);

    this.setState({
      stockInfoes: stockInfoesCopy
    });
  }

  handleInfoChange(event, i) {
    let stockInfoesCopy = copy(this.state.stockInfoes);
    const { name, value } = event.target;

    updateStockInfoesCopy(stockInfoesCopy, name, value, i);

    this.setState({
      stockInfoes: stockInfoesCopy
    });
  }

  handleDefectChange(selectedOptions, i) {
    const copyList = [...this.state.stockInfoes];

    copyList[i].defect = selectedOptions;

    this.setState({
      stockInfoes: copyList
    });
  }

  handleSubmitClick() {
    let stockInfoesCopy = copy(this.state.stockInfoes);

    // join stockInfo.defect array contents
    joinInfoesDefectArray(stockInfoesCopy);

    this.props.handleAssembleRequestSubmit(stockInfoesCopy);
  }

  checkFormAlgorithm(stockInfoes, quantitySum, currentStatus) {
    var isFormValid = false;

    // check form has errors ro invalid value
    for (let i = 0; i < stockInfoes.length; i += 1) {
      if (
        stockInfoes[i].errors.quantity === "" &&
        stockInfoes[i].quantity > 0
      ) {
        isFormValid = true;
      } else {
        isFormValid = false;
        return isFormValid;
      }
    }

    // there are at most two types for one productNo
    let quantityValid = [false, false];

    // check input total quantity is same as waitHandleStatus
    Object.keys(currentStatus).forEach(productNo => {
      Object.keys(currentStatus[productNo]).forEach((type, index) => {
        if (
          parseFloat(currentStatus[productNo][type].quantity) ===
          parseFloat(quantitySum[type])
        ) {
          quantityValid[index] = true;
        } else {
          quantityValid[index] = false;
        }
      });
    });

    // isFormValid is absoulutely true, as comparing waitHandleStatus/quantitySum
    // if there is no type satisify the criteria, return false
    // if there is a type which has the same quantity in both waitHandleStatus and quantitySum return true
    return quantityValid[0] || quantityValid[1];
  }

  render() {
    const { isSubmited, assembleOrderContent, waitHandleStatus } = this.props;
    const { stockInfoes } = this.state;
    const quantitySum = quantityAccumulate(stockInfoes);
    let isFormValid = this.checkFormAlgorithm(
      stockInfoes,
      quantitySum,
      assembleOrderContent
    );
    let productNo = Object.keys(assembleOrderContent).pop();

    if (isSubmited) {
      this.timer = setTimeout(this.props.getInitialize, 3000);

      return (
        <div className="row justify-content-md-center">
          <div className="col-md-6">
            <div className="alert alert-success" role="alert">
              <h5 className="text-center">此次入庫作業已完成</h5>
              <h5 className="text-center">3秒後將自動重整...</h5>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <React.Fragment>
          <p className="h4 text-center">組裝單資訊</p>
          <table className="table table-sm">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "25%" }}>貨號</th>
                <th style={{ width: "20%" }}>型態</th>
                <th style={{ width: "20%" }}>待處理數量</th>
                <th style={{ width: "20%" }}>目前數量</th>
                <th style={{ width: "20%" }}>單位</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(assembleOrderContent[productNo]).map(
                (type, index) => {
                  return (
                    <React.Fragment key={productNo + type + index}>
                      <tr>
                        <td>
                          <div className="form-group mb-0">
                            <input
                              type="text"
                              className="form-control"
                              name="productNo"
                              value={productNo}
                              disabled
                            />
                          </div>
                        </td>
                        <td>
                          <div className="form-group mb-0">
                            <input
                              type="text"
                              className="form-control"
                              name="type"
                              value={type}
                              disabled
                            />
                          </div>
                        </td>
                        <td>
                          <div className="form-group mb-0">
                            <input
                              type="text"
                              className="form-control"
                              name="waitHandle_quantity"
                              value={waitHandleStatus[productNo][type].quantity}
                              disabled
                            />
                          </div>
                        </td>
                        <td>
                          <div className="form-group mb-0">
                            <input
                              type="text"
                              className="form-control"
                              name="handle_quantity"
                              value={quantitySum[type].toString()}
                              disabled
                            />
                          </div>
                        </td>
                        <td>
                          <div className="form-group mb-0">
                            <input
                              type="text"
                              className="form-control"
                              name="unit"
                              value={assembleOrderContent[productNo][type].unit}
                              disabled
                            />
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                }
              )}
            </tbody>
          </table>
          <hr />
          <ToolbarForAddDeleteSubmit
            onAddClick={this.handleNewDataClick}
            onDeleteClick={this.handleDeleteDataClick}
            onSubmitClick={this.handleSubmitClick}
            deleteDisabled={stockInfoes.length === 0}
            submitDisabled={!isFormValid}
          />
          <table className="table table-sm">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "20%" }}>貨號</th>
                <th style={{ width: "8%" }}>批號</th>
                <th style={{ width: "8%" }}>型態</th>
                <th style={{ width: "15%" }}>數量</th>
                <th style={{ width: "8%" }}>單位</th>
                <th style={{ width: "8%" }}>色號</th>
                <th style={{ width: "15%" }}>瑕疵</th>
                <th style={{ width: "18%" }}>記錄</th>
              </tr>
            </thead>
            <tbody>
              {stockInfoes.map((stockInfo, index) => (
                <StockInfo
                  key={index}
                  index={index}
                  stockInfo={stockInfo}
                  errors={stockInfo.errors}
                  handleInfoChange={this.handleInfoChange}
                  handleDefectChange={this.handleDefectChange}
                />
              ))}
            </tbody>
          </table>
        </React.Fragment>
      );
    }
  }
}
export default StockInfoContainer;
