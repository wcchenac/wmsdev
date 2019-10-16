import React, { Component } from "react";
import ClothInfo from "./ClothInfo";

class ClothInfoContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productNo: this.props.productNo,
      clothInfoes: []
    };
    this.handleNewDataClick = this.handleNewDataClick.bind(this);
    this.handleDeleteDataClick = this.handleDeleteDataClick.bind(this);
    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  handleNewDataClick() {
    const { clothInfoes } = this.state;
    let newClothInfo;

    if (clothInfoes.length === 0) {
      newClothInfo = {
        productNo: this.state.productNo,
        lotNo: "",
        type: "整支",
        length: "",
        unit: "碼",
        color: "0",
        defect: "無",
        record: "",
        remark: "",
        isNew: "new",
        errors: {
          lotNo: "",
          length: ""
        }
      };
    } else {
      newClothInfo = {
        productNo: this.state.productNo,
        lotNo: clothInfoes[clothInfoes.length - 1].lotNo,
        type: clothInfoes[clothInfoes.length - 1].type,
        length: "",
        unit: clothInfoes[clothInfoes.length - 1].unit,
        color: clothInfoes[clothInfoes.length - 1].color,
        defect: clothInfoes[clothInfoes.length - 1].defect,
        record: "",
        remark: "",
        isNew: "new",
        errors: {
          lotNo: "",
          length: ""
        }
      };
    }

    this.setState({
      clothInfoes: [...this.state.clothInfoes, newClothInfo]
    });
  }

  handleDeleteDataClick() {
    const { clothInfoes } = this.state;

    clothInfoes.splice(clothInfoes.length - 1, 1);

    this.setState({
      clothInfoes: clothInfoes
    });
  }

  handleSubmitClick(e) {
    const { index } = this.props;

    this.props.handleInStockRequestSubmit(e, index, this.state.clothInfoes);
  }

  handleInfoChange(event, i) {
    let clothInfoesCopy = JSON.parse(JSON.stringify(this.state.clothInfoes));
    const { name, value } = event.target;

    switch (name) {
      case "lotNo":
        clothInfoesCopy[i].errors.lotNo = value.length < 1 ? "請定義批號" : "";
        clothInfoesCopy[i].lotNo = value;
        break;
      case "type":
        clothInfoesCopy[i].type = value;
        break;
      case "length":
        clothInfoesCopy[i].errors.length = /^\d*\.?\d+$/.test(value)
          ? ""
          : "請輸入純數字或長度不可空白";
        clothInfoesCopy[i].length = value;
        break;
      case "unit":
        clothInfoesCopy[i].unit = value;
        break;
      case "color":
        clothInfoesCopy[i].color = value;
        break;
      case "defect":
        clothInfoesCopy[i].defect = value;
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

  checkFormAlgorithm(clothInfoes) {
    var isFormValid = false;

    for (let i = 0; i < clothInfoes.length; i += 1) {
      if (
        clothInfoes[i].errors.length === "" &&
        clothInfoes[i].length > 0 &&
        clothInfoes[i].errors.lotNo === "" &&
        clothInfoes[i].lotNo > 0
      ) {
        isFormValid = true;
      } else {
        isFormValid = false;
        break;
      }
    }

    return isFormValid;
  }

  render() {
    const { productNo, clothInfoes } = this.state;
    const { index } = this.props;
    let isFormValid = this.checkFormAlgorithm(clothInfoes);

    return (
      <div className="card">
        <div
          className="card-header"
          id={"heading-" + index}
          data-toggle="collapse"
          data-parent="#accordion"
          data-target={"#collapse-" + index}
          aria-expanded="false"
          aria-controls={"collapse-" + index}
        >
          <a
            className="header-toggle"
            href={"#collapse-" + index}
            data-toggle="collapse"
            data-parent="#accordion"
          >
            貨號: {productNo}
          </a>
        </div>
        <div
          id={"collapse-" + index}
          className="collapse"
          aria-labelledby={"heading-" + index}
        >
          <div className="card-body">
            <div className="container">
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
              <table className="table">
                <thead className="thead-dark">
                  <tr>
                    <th style={{ width: "225px" }}>貨號</th>
                    <th style={{ width: "90px" }}>批號</th>
                    <th style={{ width: "100px" }}>型態</th>
                    <th style={{ width: "150px" }}>長度</th>
                    <th style={{ width: "84px" }}>單位</th>
                    <th style={{ width: "85px" }}>色號</th>
                    <th style={{ width: "90px" }}>缺陷</th>
                    <th style={{ width: "184px" }}>記錄</th>
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
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ClothInfoContainer;
