import React, { Component } from "react";
import classnames from "classnames";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  UnitOptions,
  ColorOptions,
  DefectOptions
} from "../../../../../enums/Enums";
import ShipModal from "../../Utilities/ShipModal";

class StockInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalShow: false
    };
    this.onChange = this.onChange.bind(this);
    this.onDefectChange = this.onDefectChange.bind(this);
    this.onShipCheck = this.onShipCheck.bind(this);
    this.onReansonButtonChange = this.onReansonButtonChange.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
  }

  onChange(e) {
    this.props.handleInfoChange(e, this.props.index);
  }

  onDefectChange(selectedOptions) {
    this.props.handleDefectChange(selectedOptions, this.props.index);
  }

  onShipCheck(e) {
    this.setState({ modalShow: true });
    this.props.handleShipCheck(e, this.props.index);
  }

  onReansonButtonChange(e) {
    this.props.handleReasonButton(e, this.props.index);
  }

  handleModalClose() {
    this.setState({ modalShow: false });
  }

  render() {
    const { typeValidation, errors, stockInfo } = this.props;
    const animatedComponents = makeAnimated();

    return (
      <tr>
        <td>
          <div className="form-group mb-0">
            <input
              type="text"
              className="form-control"
              name="productNo"
              value={stockInfo.productNo}
              disabled
            />
          </div>
        </td>
        <td>
          <div className="form-group mb-0">
            <input
              type="text"
              className="form-control"
              name="lotNo"
              placeholder="批號"
              value={stockInfo.lotNo}
              onChange={this.onChange}
            />
          </div>
        </td>
        <td>
          {typeValidation ? (
            <div className="form-group mb-0">
              <input
                type="text"
                className="form-control"
                name="type"
                value={stockInfo.type}
                disabled
              />
            </div>
          ) : (
            <div className="form-group mb-0">
              <select
                className="custom-select"
                name="type"
                value={stockInfo.type}
                onChange={this.onChange}
              >
                <option value="">請選擇...</option>
                <option value="整支">整支</option>
                <option value="板卷">板卷</option>
              </select>
            </div>
          )}
        </td>
        <td>
          <div className="form-group mb-0">
            <input
              type="text"
              className={classnames("form-control", {
                "is-invalid": errors.quantity
              })}
              placeholder="數量"
              name="quantity"
              onChange={this.onChange}
            />
            {errors.quantity && (
              <div className="invalid-feedback">{errors.quantity}</div>
            )}
          </div>
        </td>
        {typeValidation ? (
          <React.Fragment>
            <td>
              <div className="form-group mb-0">
                <input
                  type="text"
                  className="form-control"
                  name="unit"
                  value={stockInfo.unit}
                  disabled
                />
              </div>
            </td>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <td>
              <div className="form-group mb-0">
                <select
                  className="custom-select"
                  name="unit"
                  value={stockInfo.unit}
                  onChange={this.onChange}
                >
                  {UnitOptions.map((unit, index) => (
                    <option key={index} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </td>
            <td>
              <div className="form-group mb-0">
                <select
                  className="custom-select"
                  name="color"
                  value={stockInfo.color}
                  onChange={this.onChange}
                >
                  {ColorOptions.map((color, index) => (
                    <option key={index} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            </td>
            <td>
              <Select
                closeMenuOnSelect={false}
                components={animatedComponents}
                defaultValue={stockInfo.defect}
                isMulti
                name="defect"
                options={DefectOptions}
                onChange={this.onDefectChange}
              />
            </td>
          </React.Fragment>
        )}
        <td>
          <div className="form-group mb-0">
            <input
              type="text"
              className="form-control"
              placeholder="記錄"
              name="record"
              value={stockInfo.record}
              onChange={this.onChange}
            />
          </div>
        </td>
        <td>
          <div className="form-check mt-2 ml-2">
            <input
              type="checkbox"
              className="form-check-input"
              value={stockInfo.directShip}
              onChange={this.onShipCheck}
            />
          </div>
          <ShipModal
            outStockReason={stockInfo.outStockReason}
            onChange={this.onChange}
            onReansonButtonChange={this.onReansonButtonChange}
            onShipClick={this.handleModalClose}
            handleModalClose={this.handleModalClose}
            show={stockInfo.directShip && this.state.modalShow}
          />
        </td>
      </tr>
    );
  }
}

export default StockInfo;
