import React, { Component } from "react";
import classnames from "classnames";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { ColorOptions, DefectOptions } from "../../../../../enums/Enums";

class StockInfo extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onDefectChange = this.onDefectChange.bind(this);
  }

  onChange(e) {
    this.props.handleInfoChange(e, this.props.index);
  }

  onDefectChange(selectedOptions) {
    this.props.handleDefectChange(selectedOptions, this.props.index);
  }

  render() {
    const { errors, stockInfo } = this.props;
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
          <div className="form-group mb-0">
            <select
              className="custom-select"
              name="type"
              value={stockInfo.type}
              onChange={this.onChange}
            >
              <option value="整支">整支</option>
              <option value="板卷">板卷</option>
            </select>
          </div>
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
        <td>
          <div className="form-group mb-0">
            <select
              className="custom-select"
              name="unit"
              value={stockInfo.unit}
              onChange={this.onChange}
            >
              <option value="碼">碼</option>
              <option value="尺">尺</option>
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
        <td>
          <div className="form-group mb-0">
            <input
              type="text"
              className="form-control"
              placeholder="記錄"
              name="record"
              onChange={this.onChange}
            />
          </div>
        </td>
      </tr>
    );
  }
}

export default StockInfo;
