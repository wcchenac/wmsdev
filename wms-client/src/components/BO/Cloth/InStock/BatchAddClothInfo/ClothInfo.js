import React, { Component } from "react";
import classnames from "classnames";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  ColorOptions,
  DefectOptions,
  unitLlist
} from "../../../../../enums/Enums";

class ClothInfo extends Component {
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
    const { errors, clothInfo } = this.props;
    const animatedComponents = makeAnimated();

    return (
      <tr>
        <td>
          <div className="form-group mb-0">
            <input
              type="text"
              className="form-control"
              name="productNo"
              value={clothInfo.productNo}
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
              value={clothInfo.lotNo}
              onChange={this.onChange}
            />
          </div>
        </td>
        <td>
          <div className="form-group mb-0">
            <select
              className="custom-select"
              name="type"
              value={clothInfo.type}
              onChange={this.onChange}
            >
              <option value="">請選擇...</option>
              <option value="整支">整支</option>
              <option value="板卷">板卷</option>
              <option value="雜項">雜項</option>
            </select>
          </div>
        </td>
        <td>
          <div className="form-group mb-0">
            <input
              type="text"
              className={classnames("form-control", {
                "is-invalid": errors.length
              })}
              placeholder="長度"
              name="length"
              onChange={this.onChange}
            />
            {errors.length && (
              <div className="invalid-feedback">{errors.length}</div>
            )}
          </div>
        </td>
        <td>
          <div className="form-group mb-0">
            <select
              className="custom-select"
              name="unit"
              value={clothInfo.unit}
              onChange={this.onChange}
            >
              {unitLlist.map((unit, index) => (
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
              value={clothInfo.color}
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
            defaultValue={clothInfo.defect}
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

export default ClothInfo;
