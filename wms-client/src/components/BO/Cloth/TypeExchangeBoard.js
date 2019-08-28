import React, { Component } from "react";
import ShowExchangeRequest from "./ShowExchangeRequest";

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
  }

  handleBackClick() {
    this.props.history.goBack();
  }

  handleNewDataClick() {
    const { newClothInfoes } = this.state;
    const newClothInfo = {
      clothIdentifier: {
        productNo: this.state.oldClothInfo.clothIdentifier.productNo,
        lotNo: this.state.oldClothInfo.clothIdentifier.lotNo,
        type: "板",
        length: ""
      },
      color: "",
      defect: "",
      clothRecords: {
        record: "",
        remark: ""
      }
    };
    newClothInfoes.push(newClothInfo);
    this.setState({
      newClothInfoes: newClothInfoes
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
    const { newClothInfoes } = this.state;
    const { name, value } = request.target;
    switch (name) {
      case "type":
        newClothInfoes[i].clothIdentifier.type = value;
        break;
      case "length":
        newClothInfoes[i].clothIdentifier.length = value;
        break;
      case "color":
        newClothInfoes[i].color = value;
        break;
      case "defect":
        newClothInfoes[i].defect = value;
        break;
      case "record":
        newClothInfoes[i].clothRecords.record = value;
        break;
      case "remark":
        newClothInfoes[i].clothRecords.remark = value;
        break;
      default:
        break;
    }
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
                  <button tyep="button" className="btn btn-primary btn-block">
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

export default TypeExchangeBoard;
