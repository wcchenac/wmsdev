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
    const { clothInfo } = this.props;
    const animatedComponents = makeAnimated();

    return (
      <tr>
        <td>
          <div className="form-group">
            <select
              className="custom-select"
              name="type"
              defaultValue={clothInfo.type}
              onChange={this.handleChange}
            >
              <option value="整支">整支</option>
              <option value="板卷">板卷</option>
            </select>
          </div>
        </td>
        <td>
          <div className="form-group">
            <input
              type="text"
              className={classnames("form-control", {
                "is-invalid": clothInfo.errors.length
              })}
              placeholder="長度"
              name="length"
              onChange={this.handleChange}
            />
            {clothInfo.errors.length && (
              <div className="invalid-feedback">{clothInfo.errors.length}</div>
            )}
          </div>
        </td>
        <td>
          <div className="form-group">
            <select
              className="custom-select"
              name="unit"
              defaultValue={clothInfo.unit}
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
            defaultValue={clothInfo.defect}
            isMulti
            name="defect"
            options={DefectOptions}
            onChange={this.onDefectChange}
          />
        </td>
        <td>
          <div className="form-group">
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
