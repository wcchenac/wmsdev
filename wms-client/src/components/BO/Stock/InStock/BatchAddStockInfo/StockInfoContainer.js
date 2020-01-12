import React, { PureComponent } from "react";
import StockInfo from "./StockInfo";
import { copy } from "../../../../../utilities/DeepCopy";
import {
  quantityAccumulate,
  updateStockInfoesCopy,
  joinInfoesDefectArray
} from "../../Utilities/StockInfoHelperMethods";
import ToolbarForAddDeleteSubmit from "../../Utilities/ToolbarForAddDeleteSubmit";

class StockInfoContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      stockInfoes: []
    };
    this.handleNewDataClick = this.handleNewDataClick.bind(this);
    this.handleDeleteDataClick = this.handleDeleteDataClick.bind(this);
    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleDefectChange = this.handleDefectChange.bind(this);
  }

  handleNewDataClick() {
    const { typeValidation, waitHandleStatus } = this.props;
    const { stockInfoes } = this.state;
    const type = Object.keys(waitHandleStatus).pop();
    let newStockInfo;

    if (stockInfoes.length === 0) {
      if (typeValidation) {
        newStockInfo = {
          productNo: this.props.productNo,
          lotNo: "",
          type: type.toString(),
          quantity: "",
          unit: waitHandleStatus[type].unit,
          color: "",
          defect: "",
          record: "",
          remark: "",
          inStockType: "normal",
          orderNo: this.props.inStockOrderNo,
          errors: {
            quantity: ""
          }
        };
      } else {
        newStockInfo = {
          productNo: this.props.productNo,
          lotNo: "",
          type: type.toString(),
          quantity: "",
          unit: waitHandleStatus[type].unit,
          color: "1",
          defect: [{ label: "無", value: "無" }],
          record: "",
          remark: "",
          inStockType: "normal",
          orderNo: this.props.inStockOrderNo,
          errors: {
            quantity: ""
          }
        };
      }
    } else {
      newStockInfo = {
        productNo: this.props.productNo,
        lotNo: stockInfoes[stockInfoes.length - 1].lotNo,
        type: stockInfoes[stockInfoes.length - 1].type,
        quantity: "",
        unit: stockInfoes[stockInfoes.length - 1].unit,
        color: stockInfoes[stockInfoes.length - 1].color,
        defect: stockInfoes[stockInfoes.length - 1].defect,
        record: "",
        remark: "",
        inStockType: "normal",
        orderNo: this.props.inStockOrderNo,
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

  handleSubmitClick(e) {
    let stockInfoesCopy = copy(this.state.stockInfoes);

    if (!this.props.typeValidation) {
      joinInfoesDefectArray(stockInfoesCopy);
    }

    this.props.handleInStockRequestSubmit(e, this.props.index, stockInfoesCopy);
  }

  checkFormAlgorithm(stockInfoes, quantitySum, waitHandleStatus) {
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
    Object.keys(waitHandleStatus).forEach((type, index) => {
      if (
        parseFloat(waitHandleStatus[type].quantity) ===
        parseFloat(quantitySum[type])
      ) {
        quantityValid[index] = true;
      } else {
        quantityValid[index] = false;
      }
    });

    // isFormValid is absoulutely true, as comparing waitHandleStatus/quantitySum
    // if there is no type satisify the criteria, return false
    // if there is a type which has the same quantity in both waitHandleStatus and quantitySum return true
    return quantityValid[0] || quantityValid[1];
  }

  render() {
    const { stockInfoes } = this.state;
    const {
      sequence,
      index,
      productNo,
      typeValidation,
      waitHandleStatus
    } = this.props;
    const quantitySum = quantityAccumulate(stockInfoes);
    const isFormValid = this.checkFormAlgorithm(
      stockInfoes,
      quantitySum,
      waitHandleStatus
    );

    return (
      <div
        className={
          sequence === 0 ? "tab-pane fade show active" : "tab-pane fade"
        }
        id={"nav-" + index}
        role="tabpanel"
        aria-labelledby={"nav-tab" + index}
      >
        <p className="h4 text-center">待入庫總量</p>
        <div>
          <table className="table table-sm">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "20%" }}>貨號</th>
                <th style={{ width: "20%" }}>型態</th>
                <th style={{ width: "20%" }}>總數量</th>
                <th style={{ width: "20%" }}>目前數量</th>
                <th style={{ width: "20%" }}>單位</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(waitHandleStatus).map((type, index) => (
                <tr key={index}>
                  <td>
                    <div className="form-group mb-0">
                      <input
                        type="text"
                        className="form-control"
                        name="productNo"
                        value={productNo}
                        readOnly
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
                        readOnly
                      />
                    </div>
                  </td>
                  <td>
                    <div className="form-group mb-0">
                      <input
                        type="text"
                        className="form-control"
                        name="quantity_waitHandle"
                        value={waitHandleStatus[type].quantity}
                        readOnly
                      />
                    </div>
                  </td>
                  <td>
                    <div className="form-group mb-0">
                      <input
                        type="text"
                        className="form-control"
                        name="quantity_handled"
                        value={quantitySum[type].toString()}
                        readOnly
                      />
                    </div>
                  </td>
                  <td>
                    <div className="form-group mb-0">
                      <input
                        type="text"
                        className="form-control"
                        name="unit"
                        value={waitHandleStatus[type].unit}
                        readOnly
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              {typeValidation ? (
                <React.Fragment>
                  <th style={{ width: "20%" }}>貨號</th>
                  <th style={{ width: "15%" }}>批號</th>
                  <th style={{ width: "15%" }}>型態</th>
                  <th style={{ width: "15%" }}>數量</th>
                  <th style={{ width: "15%" }}>單位</th>
                  <th style={{ width: "20%" }}>記錄</th>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <th style={{ width: "20%" }}>貨號</th>
                  <th style={{ width: "8%" }}>批號</th>
                  <th style={{ width: "8%" }}>型態</th>
                  <th style={{ width: "15%" }}>數量</th>
                  <th style={{ width: "8%" }}>單位</th>
                  <th style={{ width: "8%" }}>色號</th>
                  <th style={{ width: "15%" }}>瑕疵</th>
                  <th style={{ width: "18%" }}>記錄</th>
                </React.Fragment>
              )}
            </tr>
          </thead>
          <tbody>
            {stockInfoes.map((stockInfo, index) => (
              <StockInfo
                key={index}
                index={index}
                typeValidation={typeValidation}
                stockInfo={stockInfo}
                errors={stockInfo.errors}
                handleInfoChange={this.handleInfoChange}
                handleDefectChange={this.handleDefectChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default StockInfoContainer;
