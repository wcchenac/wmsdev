import React, { Component } from "react";
import classnames from "classnames";

class OutStockRequest extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.handleRequestChange(e, this.props.index);
  }

  render() {
    const { errors } = this.props;

    return (
      <tr>
        <td>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="貨號"
              name="productNo"
              onChange={this.handleChange}
            />
          </div>
        </td>
        <td>
          <div className="form-group">
            <select
              className="custom-select"
              name="type"
              defaultValue="整支"
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
      </tr>
    );
  }
}

export default OutStockRequest;
