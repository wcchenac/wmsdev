import React, { Component } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { ColorOptions, DefectOptions } from "../../../../../enums/Enums";
import { copy } from "../../../../../utilities/DeepCopy";

const equal = require("fast-deep-equal");

class InformationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clothInfo: this.stateInitial(this.props.clothInfo),
      editMode: false
    };
    this.handleEditMode = this.handleEditMode.bind(this);
    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleDefectChange = this.handleDefectChange.bind(this);
    this.handleUpdateSubmit = this.handleUpdateSubmit.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (!equal(this.props.clothInfo, prevProps.clothInfo)) {
      this.setState({
        clothInfo: this.stateInitial(this.props.clothInfo),
        editMode: false
      });
    }
  }

  defectIndexMapper(string) {
    let index = undefined;
    switch (string) {
      case "無":
        index = 0;
        break;
      case "GA":
        index = 1;
        break;
      case "GB":
        index = 2;
        break;
      case "GC":
        index = 3;
        break;
      case "GD":
        index = 4;
        break;
      case "A-":
        index = 5;
        break;
      case "B":
        index = 6;
        break;
      case "C":
        index = 7;
        break;
      case "保留":
        index = 8;
        break;
      default:
        break;
    }

    return index;
  }

  defectStringTransToOptions(defectString) {
    let defectSelected = [];

    if (defectString === undefined) {
      return defectSelected;
    }

    let stringArray = defectString.split("/");

    stringArray.forEach(string => {
      defectSelected.push(DefectOptions[this.defectIndexMapper(string)]);
    });

    return defectSelected;
  }

  stateInitial(clothInfo) {
    let infoCopy = copy(clothInfo);

    infoCopy.defect = this.defectStringTransToOptions(infoCopy.defect);

    return infoCopy;
  }

  handleEditMode() {
    this.setState({ editMode: !this.state.editMode });
  }

  handleInfoChange(e) {
    let infoCopy = copy(this.state.clothInfo);
    const { name, value } = e.target;

    switch (name) {
      case "color":
        infoCopy.color = value;
        break;
      case "record":
        infoCopy.record = value;
        break;
      case "remark":
        infoCopy.remark = value;
        break;
      default:
        break;
    }

    this.setState({ clothInfo: infoCopy });
  }

  handleDefectChange(selectedOptions) {
    const copyInfo = copy(this.state.clothInfo);

    copyInfo.defect = selectedOptions;

    this.setState({
      clothInfo: copyInfo
    });
  }

  handleUpdateSubmit() {
    let newDefectContent = "";
    let { clothInfo } = this.state;

    // join clothInfo.defect array contents
    clothInfo.defect.forEach((object, index) => {
      if (index === clothInfo.defect.length - 1) {
        newDefectContent = newDefectContent + object.value;
      } else {
        newDefectContent = newDefectContent + object.value + "/";
      }
    });

    const updateInfoRequest = {
      id: this.state.clothInfo.id,
      color: this.state.clothInfo.color,
      defect: newDefectContent,
      record: this.state.clothInfo.record,
      remark: this.state.clothInfo.remark
    };

    this.props.handleClothInfoUpdate(updateInfoRequest);
  }

  renderEditModeOff() {
    const { clothInfo } = this.props;
    const { clothIdentifier } = this.props.clothInfo;

    return (
      <React.Fragment>
        <div className="modal-body">
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">貨號</label>
            <label className="col-6 col-form-label">
              {clothIdentifier.productNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">批號</label>
            <label className="col-6 col-form-label">
              {clothIdentifier.lotNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">型態</label>
            <label className="col-6 col-form-label">
              {clothIdentifier.type}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">長度</label>
            <label className="col-6 col-form-label">
              {clothIdentifier.length}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">單位</label>
            <label className="col-6 col-form-label">
              {clothIdentifier.unit}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">色號</label>
            <label className="col-6 col-form-label">{clothInfo.color}</label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">缺陷</label>
            <label className="col-6 col-form-label">{clothInfo.defect}</label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">註解</label>
            <label className="col-6 col-form-label">{clothInfo.remark}</label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">記錄</label>
            <label className="col-6 col-form-label">{clothInfo.record}</label>
          </div>
        </div>
        <div className="modal-footer"></div>
      </React.Fragment>
    );
  }

  renderEditModeOn() {
    const { clothInfo } = this.state;
    const { clothIdentifier } = this.state.clothInfo;
    const animatedComponents = makeAnimated();

    return (
      <React.Fragment>
        <div className="modal-body">
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">貨號</label>
            <label className="col-6 col-form-label">
              {clothIdentifier.productNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">批號</label>
            <label className="col-6 col-form-label">
              {clothIdentifier.lotNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">型態</label>
            <label className="col-6 col-form-label">
              {clothIdentifier.type}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">長度</label>
            <label className="col-6 col-form-label">
              {clothIdentifier.length}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">單位</label>
            <label className="col-6 col-form-label">
              {clothIdentifier.unit}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">色號</label>
            <div className="col-6">
              <select
                className="custom-select"
                name="color"
                value={clothInfo.color}
                onChange={this.handleInfoChange}
              >
                {ColorOptions.map((color, index) => (
                  <option key={index} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">缺陷</label>
            <div className="col-6">
              <Select
                closeMenuOnSelect={false}
                components={animatedComponents}
                defaultValue={clothInfo.defect}
                isMulti
                name="defect"
                options={DefectOptions}
                onChange={this.handleDefectChange}
              />
            </div>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">註解</label>
            <div className="col-6">
              <input
                type="text"
                className="form-control"
                placeholder="註解"
                name="remark"
                value={clothInfo.remark}
                onChange={this.handleInfoChange}
              />
            </div>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">記錄</label>
            <div className="col-6">
              <input
                type="text"
                className="form-control"
                placeholder="記錄"
                name="record"
                value={clothInfo.record}
                onChange={this.handleInfoChange}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={this.handleEditMode}
          >
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-dismiss="modal"
            onClick={this.handleUpdateSubmit}
          >
            確認
          </button>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { index } = this.props;
    const { editMode } = this.state;

    return (
      <div
        className="modal fade"
        id={"detailInfo-" + index}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="content"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <div className="row">
                  <div className="col-md-auto mr-auto">詳細資料</div>
                  <div className="col-md-auto">
                    <i
                      className="fa fa-pencil"
                      aria-hidden="true"
                      onClick={this.handleEditMode}
                    ></i>
                  </div>
                </div>
              </h5>
              <button
                type="button"
                className="close ml-0"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            {editMode ? this.renderEditModeOn() : this.renderEditModeOff()}
          </div>
        </div>
      </div>
    );
  }
}

export default InformationModal;
