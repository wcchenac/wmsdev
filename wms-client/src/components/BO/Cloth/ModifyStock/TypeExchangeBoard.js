import React, { Component } from "react";
import TypeExchangeRequestContainer from "./TypeExchangeRequestContainer";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { batchCreateClothInfoesForShrink } from "../../../../actions/ClothInfoAcions";
import { createFile } from "../../../../actions/FileActions";

class TypeExchangeBoard extends Component {
  constructor(props) {
    super(props);
    const { clothInfo } = props.location.state;
    this.state = {
      oldClothInfo: clothInfo,
      newClothInfoes: []
    };
    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleNewDataClick = this.handleNewDataClick.bind(this);
    this.handleDeleteDataClick = this.handleDeleteDataClick.bind(this);
    this.handleRequestChange = this.handleRequestChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  handleBackClick() {
    this.props.history.goBack();
  }

  handleNewDataClick() {
    const newClothInfo = {
      productNo: this.state.oldClothInfo.clothIdentifier.productNo,
      lotNo: this.state.oldClothInfo.clothIdentifier.lotNo,
      type: "板卷",
      length: "",
      unit: "碼",
      color: "0",
      defect: "無",
      record: this.state.oldClothInfo.record,
      remark: "",
      isNew: "old",
      parentId: this.state.oldClothInfo.clothIdentifier.id, // for history use
      errors: {
        length: ""
      }
    };

    this.setState({
      newClothInfoes: [...this.state.newClothInfoes, newClothInfo]
    });
  }

  handleDeleteDataClick() {
    const { newClothInfoes } = this.state;

    newClothInfoes.splice(newClothInfoes.length - 1, 1);

    this.setState({
      newClothInfoes: newClothInfoes
    });
  }

  handleRequestChange(request, i) {
    let newClothInfoesCopy = JSON.parse(
      JSON.stringify(this.state.newClothInfoes)
    );
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
      case "defect":
        newClothInfoesCopy[i].defect = value;
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

  handleSubmitClick() {
    const { oldClothInfo } = this.state;
    const { newClothInfoes } = this.state;
    let oldTotalLength = parseFloat(oldClothInfo.clothIdentifier.length);
    let totalLength = 0;

    let shrinkStockRequest = {
      oldClothIdentifierId: oldClothInfo.clothIdentifier.id,
      inStockRequests: newClothInfoes
    };

    for (let i = 0; i < newClothInfoes.length; i += 1) {
      totalLength += parseFloat(newClothInfoes[i].length);
    }

    let decrement = totalLength - oldTotalLength;

    if (decrement === 0) {
      if (window.confirm("是否確認送出？")) {
        this.props.batchCreateClothInfoesForShrink(
          shrinkStockRequest,
          this.props.history
        );
      }
    } else if (Math.abs(decrement) > totalLength * 0.03) {
      if (
        window.confirm(
          "減肥前後總長度不符，差異量大於平常值(差異量：" +
            decrement +
            " 碼)，是否確認送出？"
        )
      ) {
        this.props.batchCreateClothInfoesForShrink(
          shrinkStockRequest,
          this.props.history
        );
      }
    } else {
      // let createFileRequest = {
      //   productNo: oldClothInfo.clothIdentifier.productNo,
      //   decrement: decrement
      // };
      // this.props.createFile(createFileRequest);
      if (
        window.confirm(
          "減肥前後總長度不符，差異量：" + decrement + " 碼，是否確認送出？"
        )
      ) {
        this.props.batchCreateClothInfoesForShrink(
          shrinkStockRequest,
          this.props.history
        );
      }
    }
  }

  render() {
    const { oldClothInfo, newClothInfoes } = this.state;

    const checkLengthAlgorithm = clothInfoes => {
      var isLengthChecked = false;

      for (let i = 0; i < clothInfoes.length; i += 1) {
        if (clothInfoes[i].errors === "" || clothInfoes[i].length > 0) {
          isLengthChecked = true;
        } else {
          isLengthChecked = false;
          break;
        }
      }

      return isLengthChecked;
    };

    let isLengthChecked;
    isLengthChecked = checkLengthAlgorithm(newClothInfoes);

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
                onClick={this.handleSubmitClick}
                disabled={!isLengthChecked}
              >
                送出
              </button>
            </div>
          </div>
          <br />
          <TypeExchangeRequestContainer
            newClothInfoes={newClothInfoes}
            onRequestChange={this.handleRequestChange}
          />
          <hr />
        </div>
      </div>
    );
  }
}

TypeExchangeBoard.propsTypes = {
  batchCreateClothInfoesForShrink: PropTypes.func.isRequired,
  filename: PropTypes.object.isRequired,
  createFile: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  filename: state.filename
});

export default connect(
  mapStateToProps,
  {
    batchCreateClothInfoesForShrink,
    createFile
  }
)(TypeExchangeBoard);
