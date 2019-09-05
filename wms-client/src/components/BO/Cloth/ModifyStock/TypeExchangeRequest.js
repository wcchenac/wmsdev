import React, { Component } from "react";
import classnames from "classnames";

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
    return (
      <tr>
        <th scope="col">
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
        </th>
        <th scope="col">
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
          </div>
        </th>
        <th scope="col">
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
        </th>
        <th scope="col">
          <div className="form-group">
            <select
              className="custom-select"
              name="defect"
              defaultValue="無"
              onChange={this.handleChange}
            >
              <option value="無">無</option>
              <option value="GA">GA</option>
              <option value="GB">GB</option>
              <option value="GC">GC</option>
              <option value="GD">GD</option>
            </select>
          </div>
        </th>
        <th scope="col">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="註解"
              name="remark"
              onChange={this.handleChange}
            />
          </div>
        </th>
      </tr>
    );
  }
}

export default TypeExchangeRequest;
