import React, { Component } from "react";
import ModifyRequestContainer from "./ModifyRequestContainer";
import { copy } from "../../../../../utilities/DeepCopy";

class ModifyRequestBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldClothInfo: this.props.clothInfo,
      newClothInfoes: []
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

  modifyRequestInitialContent(typeExchange, sameTypeModify) {
    if (typeExchange) {
      return {
        productNo: this.state.oldClothInfo.clothIdentifier.productNo,
        lotNo: this.state.oldClothInfo.clothIdentifier.lotNo,
        type: "板卷",
        length: "",
        unit: "碼",
        color: "0",
        defect: [{ label: "無", value: "無" }],
        record: this.state.oldClothInfo.record,
        remark: "",
        inStockType: "shrink",
        parentId: this.state.oldClothInfo.clothIdentifier.id, // for history use
        errors: {
          length: ""
        }
      };
    }
    if (sameTypeModify) {
      return {
        productNo: this.state.oldClothInfo.clothIdentifier.productNo,
        lotNo: this.state.oldClothInfo.clothIdentifier.lotNo,
        type: "整支",
        length: "",
        unit: "碼",
        color: "0",
        defect: [{ label: "無", value: "無" }],
        record: this.state.oldClothInfo.record,
        remark: "",
        inStockType: "shrink",
        parentId: this.state.oldClothInfo.clothIdentifier.id, // for history use
        errors: {
          length: ""
        }
      };
    }
  }

  handleNewDataClick() {
    const { typeExchange, sameTypeModify } = this.props;
    const { newClothInfoes } = this.state;
    let newClothInfo;

    if (newClothInfoes.length === 0) {
      newClothInfo = this.modifyRequestInitialContent(
        typeExchange,
        sameTypeModify
      );
    } else {
      newClothInfo = {
        productNo: this.state.oldClothInfo.clothIdentifier.productNo,
        lotNo: this.state.oldClothInfo.clothIdentifier.lotNo,
        type: newClothInfoes[newClothInfoes.length - 1].type,
        length: "",
        unit: newClothInfoes[newClothInfoes.length - 1].unit,
        color: newClothInfoes[newClothInfoes.length - 1].color,
        defect: newClothInfoes[newClothInfoes.length - 1].defect,
        record: this.state.oldClothInfo.record,
        remark: "",
        inStockType: "shrink",
        parentId: this.state.oldClothInfo.clothIdentifier.id, // for history use
        errors: {
          lotNo: "",
          length: ""
        }
      };
    }

    this.setState({
      newClothInfoes: [...this.state.newClothInfoes, newClothInfo]
    });
  }

  handleDeleteDataClick() {
    let clothInfoesCopy = [...this.state.newClothInfoes];

    clothInfoesCopy.splice(clothInfoesCopy.length - 1, 1);

    this.setState({
      newClothInfoes: clothInfoesCopy
    });
  }

  handleRequestChange(request, i) {
    let newClothInfoesCopy = copy(this.state.newClothInfoes);
    const { name, value } = request.target;

    switch (name) {
      case "type":
        newClothInfoesCopy[i].type = value;
        break;
      case "length":
        newClothInfoesCopy[i].errors.length = /^\d*\.?\d+$/.test(value)
          ? ""
          : "請輸入純數字或長度不可空白";
        newClothInfoesCopy[i].length = value;
        break;
      case "unit":
        newClothInfoesCopy[i].unit = value;
        break;
      case "color":
        newClothInfoesCopy[i].color = value;
        break;
      case "record":
        newClothInfoesCopy[i].record = value;
        break;
      case "remark":
        newClothInfoesCopy[i].remark = value;
        break;
      default:
        break;
    }

    this.setState({ newClothInfoes: newClothInfoesCopy });
  }

  handleDefectChange(selectedOptions, i) {
    const copyList = [...this.state.newClothInfoes];

    copyList[i].defect = selectedOptions;

    this.setState({
      newClothInfoes: copyList
    });
  }

  handleSubmitClick() {
    const { oldClothInfo } = this.state;
    const { newClothInfoes } = this.state;
    let clothInfoesCopy = copy(newClothInfoes);

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

    let shrinkStockRequest = {
      oldClothIdentifierId: oldClothInfo.clothIdentifier.id,
      inStockRequests: clothInfoesCopy
    };

    this.props.batchCreateClothInfoesForShrink(shrinkStockRequest).then(res => {
      if (res.status === 200) {
        this.props.initialComponent();
      }
    });
  }

  modalContent() {
    const { oldClothInfo } = this.state;
    const { newClothInfoes } = this.state;
    let oldTotalLength = parseFloat(oldClothInfo.clothIdentifier.length);
    let totalLength = 0;

    for (let i = 0; i < newClothInfoes.length; i += 1) {
      totalLength += parseFloat(newClothInfoes[i].length);
    }

    let decrement = totalLength - oldTotalLength;

    if (decrement === 0) {
      return (
        <React.Fragment>
          <p>減肥前後總長度相符，是否確認送出？</p>
        </React.Fragment>
      );
    } else if (Math.abs(decrement) > totalLength * 0.03) {
      return (
        <React.Fragment>
          <p>
            減肥前後總長度不符，且差異量大於平常值(差異量：
            {decrement} 碼)，是否確認送出？
          </p>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <p>減肥前後總長度不符，差異量： {decrement} 碼，是否確認送出？</p>
        </React.Fragment>
      );
    }
  }

  checkLengthAlgorithm(clothInfoes) {
    var isLengthChecked = false;

    for (let i = 0; i < clothInfoes.length; i += 1) {
      if (clothInfoes[i].errors.length === "" && clothInfoes[i].length > 0) {
        isLengthChecked = true;
      } else {
        isLengthChecked = false;
        break;
      }
    }

    return isLengthChecked;
  }

  render() {
    const { oldClothInfo, newClothInfoes } = this.state;
    let isLengthChecked = this.checkLengthAlgorithm(newClothInfoes);
    let modalContent = this.modalContent();

    return (
      <div className="cloth_info">
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
                <th scope="col">長度</th>
                <th scope="col">單位</th>
                <th scope="col">色號</th>
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
                      value={oldClothInfo.clothIdentifier.productNo}
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
                      value={oldClothInfo.clothIdentifier.lotNo}
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
                      value={oldClothInfo.clothIdentifier.type}
                      disabled
                    />
                  </div>
                </td>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="length"
                      value={oldClothInfo.clothIdentifier.length}
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
                      value={oldClothInfo.clothIdentifier.unit}
                      disabled
                    />
                  </div>
                </td>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="color"
                      value={oldClothInfo.color}
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
                      value={oldClothInfo.record}
                      disabled
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
                    disabled={newClothInfoes.length === 0}
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
          <ModifyRequestContainer
            newClothInfoes={newClothInfoes}
            onRequestChange={this.handleRequestChange}
            handleDefectChange={this.handleDefectChange}
          />
          <hr />
        </div>
      </div>
    );
  }
}

export default ModifyRequestBoard;
