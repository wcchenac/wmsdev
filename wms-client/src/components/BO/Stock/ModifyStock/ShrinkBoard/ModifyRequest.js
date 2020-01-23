import React, { Component } from "react";
import classnames from "classnames";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { DefectOptions } from "../../../../../enums/Enums";

class ModifyRequest extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.onDefectChange = this.onDefectChange.bind(this);
  }

  handleChange(e) {
    this.props.onRequestChange(e, this.props.index);
  }

  onDefectChange(selectedOptions) {
    this.props.handleDefectChange(selectedOptions, this.props.index);
  }

  render() {
    const { typeValidation, stockInfo } = this.props;
    const animatedComponents = makeAnimated();

    return (
      <tr>
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
                defaultValue={stockInfo.type}
                onChange={this.handleChange}
              >
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
                "is-invalid": stockInfo.errors.quantity
              })}
              placeholder="數量"
              name="quantity"
              onChange={this.handleChange}
            />
            {stockInfo.errors.quantity && (
              <div className="invalid-feedback">
                {stockInfo.errors.quantity}
              </div>
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
                  defaultValue={stockInfo.unit}
                  onChange={this.handleChange}
                >
                  <option value="碼">碼</option>
                  <option value="尺">尺</option>
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
              placeholder="註解"
              name="remark"
              onChange={this.handleChange}
            />
          </div>
        </td>
      </tr>
    );
  }
}

export default ModifyRequest;