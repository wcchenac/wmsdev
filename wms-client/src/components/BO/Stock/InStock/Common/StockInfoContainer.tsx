import React, { PureComponent } from "react";
import StockInfo, { InStockEditorRow } from "./StockInfo";
import { copy } from "../../../../../utilities/DeepCopy";
import {
  quantityAccumulate,
  updateStockInfoesCopy,
  joinInfoesDefectArray,
} from "../../Utilities/StockInfoHelperMethods";
import ToolbarForAddDeleteSubmit from "../../Utilities/ToolbarForAddDeleteSubmit";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../../Others/Spinner";
import { DefectOptions } from "../../../../../enums/Enums";
import type { ValueType } from "react-select";
import type { DefectOption, StatusByType } from "../../../../../types/domain";
import type { MutableStockRow } from "../../Utilities/StockInfoHelperMethods";

interface Props {
  sequence: number;
  index: number;
  productNo: string;
  orderNo: string;
  type: string;
  isLoading: boolean;
  typeValidation: boolean;
  waitHandleStatus: StatusByType;
  handleInStockRequestSubmit: (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number,
    inStockRequests: InStockEditorRow[]
  ) => void;
}

interface State {
  assignRowNum: number | string;
  stockInfoes: InStockEditorRow[];
}

class StockInfoContainer extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      assignRowNum: 0,
      stockInfoes: [this.initialInfoContent()],
    };
    this.handleNewDataClick = this.handleNewDataClick.bind(this);
    this.handleDeleteDataClick = this.handleDeleteDataClick.bind(this);
    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleDefectChange = this.handleDefectChange.bind(this);
    this.handleShipCheck = this.handleShipCheck.bind(this);
    this.handleReasonButton = this.handleReasonButton.bind(this);
    this.handleRowNumChange = this.handleRowNumChange.bind(this);
    this.handleRowNumSubmit = this.handleRowNumSubmit.bind(this);
  }

  initialInfoContent(): InStockEditorRow {
    const { typeValidation, waitHandleStatus } = this.props;
    const type = Object.keys(waitHandleStatus).pop();
    const typeName = (type as string).toString();
    const newStockInfo: InStockEditorRow = {
      productNo: this.props.productNo,
      lotNo: "",
      type: typeName,
      quantity: "",
      unit: waitHandleStatus[typeName].unit,
      color: "1",
      defect: [DefectOptions[0]],
      record: "",
      remark: "",
      inStockType: this.props.type,
      orderNo: this.props.orderNo,
      directShip: false,
      outStockReason: "",
      errors: {
        quantity: "",
      },
    };
    if (typeValidation) {
      newStockInfo.color = "";
      newStockInfo.defect = "";
    }

    return newStockInfo;
  }

  blankFrom(previous: InStockEditorRow | undefined): InStockEditorRow {
    if (!previous) {
      return this.initialInfoContent();
    }

    return {
      productNo: this.props.productNo,
      lotNo: previous.lotNo,
      type: previous.type,
      quantity: "",
      unit: previous.unit,
      color: previous.color,
      defect: previous.defect,
      record: "",
      remark: "",
      inStockType: this.props.type,
      orderNo: this.props.orderNo,
      directShip: false,
      outStockReason: "",
      errors: {
        quantity: "",
      },
    };
  }

  handleNewDataClick() {
    const { stockInfoes } = this.state;
    const newStockInfo = this.blankFrom(stockInfoes[stockInfoes.length - 1]);

    this.setState({
      stockInfoes: [...this.state.stockInfoes, newStockInfo],
    });
  }

  handleDeleteDataClick() {
    const stockInfoesCopy = [...this.state.stockInfoes];

    stockInfoesCopy.splice(stockInfoesCopy.length - 1, 1);

    this.setState({
      stockInfoes: stockInfoesCopy,
    });
  }

  handleInfoChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    i: number
  ) {
    const stockInfoesCopy = copy(this.state.stockInfoes) as InStockEditorRow[];
    const { name, value } = event.target;

    updateStockInfoesCopy(stockInfoesCopy as MutableStockRow[], name, value, i);

    this.setState({
      stockInfoes: stockInfoesCopy,
    });
  }

  handleDefectChange(selectedOptions: ValueType<DefectOption, true>, i: number) {
    const copyList = [...this.state.stockInfoes];

    copyList[i].defect = selectedOptions;

    this.setState({
      stockInfoes: copyList,
    });
  }

  handleShipCheck(checked: boolean, i: number) {
    const copyList = [...this.state.stockInfoes];

    copyList[i].directShip = checked;

    if (!checked) {
      copyList[i].outStockReason = "";
    }

    this.setState({
      stockInfoes: copyList,
    });
  }

  handleReasonButton(value: string, i: number) {
    const copyList = [...this.state.stockInfoes];

    copyList[i].outStockReason = value;

    this.setState({
      stockInfoes: copyList,
    });
  }

  handleRowNumChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.name === "assignRowNum") {
      this.setState({ assignRowNum: e.target.value });
    }
  }

  handleRowNumSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const stockInfoesCopy = copy(this.state.stockInfoes) as InStockEditorRow[];
    const { stockInfoes } = this.state;
    const newStockInfo = this.blankFrom(stockInfoes[stockInfoes.length - 1]);

    for (let i = 0; i < Number(this.state.assignRowNum); i += 1) {
      stockInfoesCopy.push(newStockInfo);
    }

    this.setState({ assignRowNum: 0, stockInfoes: stockInfoesCopy });
  }

  handleSubmitClick(e: React.MouseEvent<HTMLButtonElement>) {
    const stockInfoesCopy = copy(this.state.stockInfoes) as InStockEditorRow[];

    if (!this.props.typeValidation) {
      joinInfoesDefectArray(stockInfoesCopy as MutableStockRow[]);
    }

    this.props.handleInStockRequestSubmit(
      e,
      this.props.index,
      stockInfoesCopy
    );
  }

  checkFormAlgorithm(
    stockInfoes: InStockEditorRow[],
    typeList: string[],
    quantitySum: Record<string, number>,
    waitHandleStatus: StatusByType
  ) {
    let isFormValid = false;

    if (stockInfoes.length === 0) {
      return isFormValid;
    }

    // check form has errors or invalid value
    for (let i = 0; i < stockInfoes.length; i += 1) {
      if (
        stockInfoes[i].errors.quantity === "" &&
        Number(stockInfoes[i].quantity) > 0
      ) {
        isFormValid = true;
      } else {
        isFormValid = false;
        return isFormValid;
      }
    }

    const quantityValid: Record<string, boolean> = {
      雜項: false,
      整支: false,
      板卷: false,
    };

    // check input total quantity is same as waitHandleStatus
    typeList.forEach((type) => {
      if (
        parseFloat(waitHandleStatus[type].quantity) ===
        parseFloat(String(quantitySum[type]))
      ) {
        quantityValid[type] = true;
      } else {
        quantityValid[type] = false;
      }
    });

    // every type in waitHandleStatus must to meet the equation
    // "quantitySum[type] equal to waitHandleStatus[type].quantity"
    // otherwise, return false
    if (typeList.length === 1) {
      return quantityValid[typeList[0]];
    } else if (typeList.length === 2) {
      return quantityValid["板卷"] && quantityValid["整支"];
    } else {
      return false;
    }
  }

  render() {
    const { stockInfoes, assignRowNum } = this.state;
    const { sequence, index, productNo, typeValidation, waitHandleStatus } =
      this.props;
    const typeList = Object.keys(waitHandleStatus);
    const quantitySum = quantityAccumulate(stockInfoes);
    const isFormValid = this.checkFormAlgorithm(
      stockInfoes,
      typeList,
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
        aria-labelledby={"nav-tab-" + index}
      >
        <LoadingOverlay active={this.props.isLoading} spinner={<Spinner />}>
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
                {Object.keys(waitHandleStatus).map((type, rowIndex) => (
                  <tr key={rowIndex}>
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
            handleRowNumChange={this.handleRowNumChange}
            handleRowNumSubmit={this.handleRowNumSubmit}
            deleteDisabled={stockInfoes.length === 0}
            submitDisabled={!isFormValid}
            assignRowNum={assignRowNum}
          />
          <table className="table table-sm">
            <thead className="thead-dark">
              <tr>
                {typeValidation ? (
                  <React.Fragment>
                    <th style={{ width: "20%" }}>貨號</th>
                    <th style={{ width: "14%" }}>批號</th>
                    <th style={{ width: "14%" }}>型態</th>
                    <th style={{ width: "14%" }}>數量</th>
                    <th style={{ width: "14%" }}>單位</th>
                    <th style={{ width: "20%" }}>記錄</th>
                    <th style={{ width: "4%" }}>直出</th>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <th style={{ width: "20%" }}>貨號</th>
                    <th style={{ width: "8%" }}>批號</th>
                    <th style={{ width: "8%" }}>型態</th>
                    <th style={{ width: "12%" }}>數量</th>
                    <th style={{ width: "8%" }}>單位</th>
                    <th style={{ width: "8%" }}>色號</th>
                    <th style={{ width: "16%" }}>瑕疵</th>
                    <th style={{ width: "16%" }}>記錄</th>
                    <th style={{ width: "4%" }}>直出</th>
                  </React.Fragment>
                )}
              </tr>
            </thead>
            <tbody>
              {stockInfoes.map((stockInfo, rowIndex) => (
                <StockInfo
                  key={rowIndex}
                  index={rowIndex}
                  typeValidation={typeValidation}
                  stockInfo={stockInfo}
                  errors={stockInfo.errors}
                  typeList={typeList}
                  handleInfoChange={this.handleInfoChange}
                  handleDefectChange={this.handleDefectChange}
                  handleShipCheck={this.handleShipCheck}
                  handleReasonButton={this.handleReasonButton}
                />
              ))}
            </tbody>
          </table>
        </LoadingOverlay>
      </div>
    );
  }
}

export default StockInfoContainer;
