import React, { PureComponent } from "react";
import ClothInfo from "./ClothInfo";
import { copy } from "../../../../../utilities/DeepCopy";

class ClothInfoContainer extends PureComponent {
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
    this.handleDefectChange = this.handleDefectChange.bind(this);
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
        color: "1",
        defect: [{ label: "無", value: "無" }],
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
    let clothInfoesCopy = [...this.state.clothInfoes];

    clothInfoesCopy.splice(clothInfoesCopy.length - 1, 1);

    this.setState({
      clothInfoes: clothInfoesCopy
    });
  }

  handleSubmitClick(e) {
    let clothInfoesCopy = JSON.parse(JSON.stringify(this.state.clothInfoes));

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

    this.props.handleInStockRequestSubmit(e, this.props.index, clothInfoesCopy);
  }

  handleInfoChange(event, i) {
    let clothInfoesCopy = copy(this.state.clothInfoes);
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

  handleDefectChange(selectedOptions, i) {
    const copyList = [...this.state.clothInfoes];

    copyList[i].defect = selectedOptions;

    this.setState({
      clothInfoes: copyList
    });
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
    const { clothInfoes } = this.state;
    const { sequence, index } = this.props;
    let isFormValid = this.checkFormAlgorithm(clothInfoes);

    return (
      <div
        className={
          sequence === 0 ? "tab-pane fade show active" : "tab-pane fade"
        }
        id={"nav-" + index}
        role="tabpanel"
        aria-labelledby={"nav-tab" + index}
      >
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
              <div className="btn-group" role="group" aria-label="Second group">
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
              <th style={{ width: "15%" }}>長度</th>
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
      </div>
    );
  }
}

export default ClothInfoContainer;
