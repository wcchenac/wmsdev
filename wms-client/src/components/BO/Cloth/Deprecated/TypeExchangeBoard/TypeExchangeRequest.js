import React, { Component } from "react";
import classnames from "classnames";
import { DefectList } from "../../../../../enums/Enums";

class TypeExchangeRequest extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onRequestChange(e, this.props.index);
  }

  render() {
    const { errors } = this.props;
    let defectList = Object.values(DefectList);

    return (
      <tr>
        <td>
          <div className="form-group">
            <select
              className="custom-select"
              name="type"
              defaultValue="板卷"
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
                "is-invalid": errors.length
              })}
              placeholder="長度"
              name="length"
              onChange={this.handleChange}
            />
            {errors.length && (
              <div className="invalid-feedback">{errors.length}</div>
            )}
          </div>
        </td>
        <td>
          <div className="form-group">
            <select
              className="custom-select"
              name="unit"
              defaultValue="碼"
              onChange={this.handleChange}
            >
              <option value="碼">碼</option>
              <option value="尺">尺</option>
            </select>
          </div>
        </td>
        <td>
          <div className="form-group">
            <select
              className="custom-select"
              name="defect"
              // defaultValue={["無"]}
              onChange={this.handleChange}
              multiple
            >
              {defectList.map((defect, index) => (
                <option key={index} value={defect}>
                  {defect}
                </option>
              ))}
            </select>
          </div>
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

export default TypeExchangeRequest;
