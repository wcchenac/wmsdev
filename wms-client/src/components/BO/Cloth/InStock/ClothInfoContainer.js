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
  }

  handleNewDataClick() {
    const newClothInfo = {
      productNo: this.state.productNo,
      type: "整支",
      length: "",
      unit: "碼",
      color: "0",
      defect: "無",
      record: "",
      remark: "",
      isNew: "new",
      errors: {
        length: ""
      }
    };
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

  handleInfoChange(event, i) {
    let clothInfoesCopy = JSON.parse(JSON.stringify(this.state.clothInfoes));
    const { name, value } = event.target;
    switch (name) {
      case "type":
        clothInfoesCopy[i].type = value;
        break;
      case "length":
        clothInfoesCopy[i].errors.length =
          value.length < 1 ? "長度不可空白" : "";
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

  render() {
    const { productNo, clothInfoes } = this.state;
    const { index } = this.props;

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
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">貨號</th>
                  <th scope="col">型態</th>
                  <th scope="col">長度</th>
                  <th scope="col">單位</th>
                  <th scope="col">色號</th>
                  <th scope="col">缺陷</th>
                  <th scope="col">記錄</th>
                </tr>
              </thead>
              <tbody>
                {clothInfoes.map((clothInfo, index) => (
                  <ClothInfo
                    key={index}
                    index={index}
                    productNo={clothInfo.productNo}
                    errors={clothInfo.errors}
                    handleInfoChange={this.handleInfoChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default ClothInfoContainer;
