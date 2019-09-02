import React, { Component } from "react";
import ShowExchangeRequest from "./ShowExchangeRequest";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  purgeOldClothInfo,
  typeExchangeBatchCreateClothInfo
} from "../../../../actions/ClothInfoAcions";

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
      color: "0",
      defect: "無",
      record: "",
      remark: "",
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
        newClothInfoesCopy[i].errors.length =
          value.length < 1 ? "長度不可空白" : "";
        newClothInfoesCopy[i].length = value;
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
    let newClothInfoes = this.state.newClothInfoes;
    for (let i = 0; i < newClothInfoes.length; i += 1) {
      delete newClothInfoes[i]["errors"];
    }
    this.props.purgeOldClothInfo(oldClothInfo.clothIdentifier.id);
    this.props.typeExchangeBatchCreateClothInfo(
      newClothInfoes,
      this.props.history
    );
  }

  render() {
    const { oldClothInfo, newClothInfoes } = this.state;
    return (
      <div className="cloth_info">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <button
                type="button"
                onClick={this.handleBackClick}
                className="btn btn-secondary"
              >
                返回
              </button>
              <p className="h3 text-center">異動資料</p>
              <hr />
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">貨號</th>
                    <th scope="col">批號</th>
                    <th scope="col">型態</th>
                    <th scope="col">長度</th>
                    <th scope="col">色號</th>
                    <th scope="col">記錄</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="col">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          name="productNo"
                          value={oldClothInfo.clothIdentifier.productNo}
                          disabled
                        />
                      </div>
                    </th>
                    <th scope="col">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          name="lotNo"
                          value={oldClothInfo.clothIdentifier.lotNo}
                          disabled
                        />
                      </div>
                    </th>
                    <th scope="col">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          name="type"
                          value={oldClothInfo.clothIdentifier.type}
                          disabled
                        />
                      </div>
                    </th>
                    <th scope="col">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          name="length"
                          value={oldClothInfo.clothIdentifier.length}
                          disabled
                        />
                      </div>
                    </th>
                    <th scope="col">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          name="color"
                          value={oldClothInfo.clothIdentifier.color}
                          disabled
                        />
                      </div>
                    </th>
                    <th scope="col">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          name="record"
                          value={oldClothInfo.clothIdentifier.record}
                          disabled
                        />
                      </div>
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
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
                  >
                    刪除資料
                  </button>
                </div>
                <div className="col-1 offset-8">
                  <button
                    tyep="button"
                    className="btn btn-primary btn-block"
                    onClick={this.handleSubmitClick}
                  >
                    送出
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <br />
              <ShowExchangeRequest
                newClothInfoes={newClothInfoes}
                onRequestChange={this.handleRequestChange}
              />
              <hr />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TypeExchangeBoard.propsTypes = {
  typeExchangeBatchCreateClothInfo: PropTypes.func.isRequired,
  purgeOldClothInfo: PropTypes.func.isRequired
};

export default connect(
  null,
  { purgeOldClothInfo, typeExchangeBatchCreateClothInfo }
)(TypeExchangeBoard);
