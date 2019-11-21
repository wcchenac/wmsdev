import React, { Component } from "react";
import ClothInfo from "./ClothInfo";
import { copy } from "../../../../../utilities/DeepCopy";

class ClothInfoContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmited: false,
      clothInfoes: []
    };
    this.handleNewDataClick = this.handleNewDataClick.bind(this);
    this.handleDeleteDataClick = this.handleDeleteDataClick.bind(this);
    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleDefectChange = this.handleDefectChange.bind(this);
  }

  handleNewDataClick() {
    const { assembleOrderContent } = this.props;
    const { clothInfoes } = this.state;
    const productNo = Object.keys(assembleOrderContent)[0];
    const type = Object.keys(assembleOrderContent[productNo]);
    let newClothInfo;

    if (clothInfoes.length === 0) {
      newClothInfo = {
        productNo: productNo,
        lotNo: "",
        type: type.toString(),
        length: "",
        unit: assembleOrderContent[productNo][type].unit,
        color: "1",
        defect: [{ label: "無", value: "無" }],
        record: "",
        remark: "",
        inStockType: "assemble",
        orderNo: this.props.assembleOrderNo,
        errors: {
          length: ""
        }
      };
    } else {
      newClothInfo = {
        productNo: productNo,
        lotNo: clothInfoes[clothInfoes.length - 1].lotNo,
        type: clothInfoes[clothInfoes.length - 1].type,
        length: "",
        unit: clothInfoes[clothInfoes.length - 1].unit,
        color: clothInfoes[clothInfoes.length - 1].color,
        defect: clothInfoes[clothInfoes.length - 1].defect,
        record: "",
        remark: "",
        inStockType: "assemble",
        orderNo: this.props.assembleOrderNo,
        errors: {
          length: ""
        }
      };
    }

    this.setState({
      clothInfoes: [...this.state.clothInfoes, newClothInfo]
    });
  }

  handleDeleteDataClick() {
    let clothInfoesCopy = [...this.state.clothInfoes];

    clothInfoesCopy.splice(clothInfoesCopy.length - 1, 1);

    this.setState({
      clothInfoes: clothInfoesCopy
    });
  }

  handleDefectChange(selectedOptions, i) {
    const copyList = [...this.state.clothInfoes];

    copyList[i].defect = selectedOptions;

    this.setState({
      clothInfoes: copyList
    });
  }

  handleInfoChange(event, i) {
    let clothInfoesCopy = copy(this.state.clothInfoes);
    const { name, value } = event.target;

    switch (name) {
      case "lotNo":
        clothInfoesCopy[i].lotNo = value;
        break;
      case "type":
        clothInfoesCopy[i].type = value;
        break;
      case "length":
        clothInfoesCopy[i].errors.length = /^\d*\.?\d+$/.test(value)
          ? ""
          : "請輸入純數字或數量不可空白";
        clothInfoesCopy[i].length = value;
        break;
      case "unit":
        clothInfoesCopy[i].unit = value;
        break;
      case "color":
        clothInfoesCopy[i].color = value;
        break;
      case "record":
        clothInfoesCopy[i].record = value;
        break;
      case "remark":
        clothInfoesCopy[i].remark = value;
        break;
      default:
        break;
    }

    this.setState({ clothInfoes: clothInfoesCopy });
  }

  handleSubmitClick() {
    let clothInfoesCopy = copy(this.state.clothInfoes);

    // join clothInfo.defect array contents
    clothInfoesCopy.forEach((clothInfo, index) => {
      let newDefectContent = "";

      clothInfo.defect.forEach((object, index) => {
        if (index === clothInfo.defect.length - 1) {
          newDefectContent = newDefectContent + object.value;
        } else {
          newDefectContent = newDefectContent + object.value + "/";
        }
      });

      clothInfoesCopy[index].defect = newDefectContent;
    });

    this.props.handleAssembleRequestSubmit(clothInfoesCopy).then(res => {
      if (res.status === 200) {
        this.setState({
          isSubmited: true
        });
      }
    });
  }

  checkFormAlgorithm(clothInfoes, quantitySum, currentStatus) {
    var isFormValid = false;

    // check form has errors ro invalid value
    for (let i = 0; i < clothInfoes.length; i += 1) {
      if (clothInfoes[i].errors.length === "" && clothInfoes[i].length > 0) {
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
          parseFloat(currentStatus[productNo][type].length) ===
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

  quantitySum(clothInfoes) {
    let roll = 0.0;
    let board = 0.0;
    let item = 0.0;

    for (let i = 0; i < clothInfoes.length; i += 1) {
      if (clothInfoes[i].type === "整支") {
        roll += parseFloat(clothInfoes[i].length);
      }
      if (clothInfoes[i].type === "板卷") {
        board += parseFloat(clothInfoes[i].length);
      }
      if (clothInfoes[i].type === "雜項") {
        item += parseFloat(clothInfoes[i].length);
      }
    }
    
    return { 整支: roll, 板卷: board, 雜項: item };
  }

  render() {
    const {
      assembleOrderNo,
      assembleOrderContent,
      waitHandleStatus
    } = this.props;
    const { isSubmited, clothInfoes } = this.state;
    const quantitySum = this.quantitySum(clothInfoes);
    let isFormValid = this.checkFormAlgorithm(
      clothInfoes,
      quantitySum,
      assembleOrderContent
    );
    let productNo = Object.keys(assembleOrderContent)[0];
    let type = Object.keys(assembleOrderContent[productNo]);

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
          <p className="h4 text-center">
            {"組裝單(" + assembleOrderNo + ")資訊"}
          </p>
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
                      name="waitHandle_length"
                      value={waitHandleStatus[productNo][type].length}
                      disabled
                    />
                  </div>
                </td>
                <td>
                  <div className="form-group mb-0">
                    <input
                      type="text"
                      className="form-control"
                      name="handle_length"
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
            </tbody>
          </table>
          <hr />
          <div className="row">
            <div className="col-md-auto mr-auto">
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
                    disabled={clothInfoes.length === 0}
                  >
                    刪除資料
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-auto">
              <button
                tyep="button"
                className="btn btn-primary btn-block"
                onClick={this.handleSubmitClick}
                disabled={!isFormValid}
              >
                送出
              </button>
            </div>
          </div>
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
              {clothInfoes.map((clothInfo, index) => (
                <ClothInfo
                  key={index}
                  index={index}
                  clothInfo={clothInfo}
                  errors={clothInfo.errors}
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
export default ClothInfoContainer;
