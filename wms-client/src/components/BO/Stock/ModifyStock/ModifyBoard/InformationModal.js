import React, { Component } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { ColorOptions, DefectOptions } from "../../../../../enums/Enums";
import { copy } from "../../../../../utilities/DeepCopy";
import {
  joinInfoDefectArray,
  updateStockInfoCopy,
  defectStringTransToOptions
} from "../../Utilities/StockInfoHelperMethods";

const equal = require("fast-deep-equal");

class InformationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stockInfo: this.stateInitial(this.props.stockInfo),
      editMode: false
    };
    this.handleEditMode = this.handleEditMode.bind(this);
    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleDefectChange = this.handleDefectChange.bind(this);
    this.handleUpdateSubmit = this.handleUpdateSubmit.bind(this);
  }

  stateInitial(stockInfo) {
    let infoCopy = copy(stockInfo);

    infoCopy.defect = defectStringTransToOptions(infoCopy.defect);

    return infoCopy;
  }

  componentDidUpdate(prevProps) {
    if (!equal(this.props.stockInfo, prevProps.stockInfo)) {
      this.setState({
        stockInfo: this.stateInitial(this.props.stockInfo),
        editMode: false
      });
    }
  }

  handleEditMode() {
    this.setState({ editMode: !this.state.editMode });
  }

  handleInfoChange(e) {
    let infoCopy = copy(this.state.stockInfo);
    const { name, value } = e.target;

    updateStockInfoCopy(infoCopy, name, value);

    this.setState({ stockInfo: infoCopy });
  }

  handleDefectChange(selectedOptions) {
    const copyInfo = copy(this.state.stockInfo);

    copyInfo.defect = selectedOptions;

    this.setState({
      stockInfo: copyInfo
    });
  }

  handleUpdateSubmit() {
    let { stockInfo } = this.state;

    const updateInfoRequest = {
      id: stockInfo.id,
      color: stockInfo.color,
      defect: joinInfoDefectArray(stockInfo),
      record: stockInfo.record,
      remark: stockInfo.remark
    };

    this.props.handleStockInfoUpdate(updateInfoRequest);
  }

  renderEditModeOff() {
    const { typeValidation, stockInfo } = this.props;
    const { stockIdentifier } = this.props.stockInfo;

    return (
      <React.Fragment>
        <div className="modal-body">
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">貨號</label>
            <label className="col-6 col-form-label">
              {stockIdentifier.productNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">批號</label>
            <label className="col-6 col-form-label">
              {stockIdentifier.lotNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">型態</label>
            <label className="col-6 col-form-label">
              {stockIdentifier.type}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">數量</label>
            <label className="col-6 col-form-label">
              {stockIdentifier.quantity}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">單位</label>
            <label className="col-6 col-form-label">
              {stockIdentifier.unit}
            </label>
          </div>
          {typeValidation ? null : (
            <React.Fragment>
              <div className="form-group row mb-0">
                <label className="col-6 col-form-label text-center">色號</label>
                <label className="col-6 col-form-label">
                  {stockInfo.color}
                </label>
              </div>
              <div className="form-group row mb-0">
                <label className="col-6 col-form-label text-center">瑕疵</label>
                <label className="col-6 col-form-label">
                  {stockInfo.defect}
                </label>
              </div>
            </React.Fragment>
          )}
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">註解</label>
            <label className="col-6 col-form-label">{stockInfo.remark}</label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">記錄</label>
            <label className="col-6 col-form-label">{stockInfo.record}</label>
          </div>
        </div>
        <div className="modal-footer"></div>
      </React.Fragment>
    );
  }

  renderEditModeOn() {
    const { typeValidation } = this.props;
    const { stockInfo } = this.state;
    const { stockIdentifier } = this.state.stockInfo;
    const animatedComponents = makeAnimated();

    return (
      <React.Fragment>
        <div className="modal-body">
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">貨號</label>
            <label className="col-6 col-form-label">
              {stockIdentifier.productNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">批號</label>
            <label className="col-6 col-form-label">
              {stockIdentifier.lotNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">型態</label>
            <label className="col-6 col-form-label">
              {stockIdentifier.type}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">數量</label>
            <label className="col-6 col-form-label">
              {stockIdentifier.quantity}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">單位</label>
            <label className="col-6 col-form-label">
              {stockIdentifier.unit}
            </label>
          </div>
          {typeValidation ? null : (
            <React.Fragment>
              <div className="form-group row mb-0">
                <label className="col-6 col-form-label text-center">色號</label>
                <div className="col-6">
                  <select
                    className="custom-select"
                    name="color"
                    value={stockInfo.color}
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
                <label className="col-6 col-form-label text-center">瑕疵</label>
                <div className="col-6">
                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    defaultValue={stockInfo.defect}
                    isMulti
                    name="defect"
                    options={DefectOptions}
                    onChange={this.handleDefectChange}
                  />
                </div>
              </div>
            </React.Fragment>
          )}
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">註解</label>
            <div className="col-6">
              <input
                type="text"
                className="form-control"
                placeholder="註解"
                name="remark"
                value={stockInfo.remark}
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
                value={stockInfo.record}
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
