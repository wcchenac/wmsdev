import React, { Component } from "react";
import classnames from "classnames";

class ClothInfo extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.handleInfoChange(e, this.props.index);
  }

  render() {
    const { errors } = this.props;
    return (
      <tr>
        <th scope="col">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              name="productNo"
              value={this.props.productNo}
              disabled
            />
          </div>
        </th>
        <th scope="col">
          <div className="form-group">
            <select
              className="custom-select"
              name="type"
              defaultValue="整支"
              onChange={this.onChange}
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
              onChange={this.onChange}
            />
            {errors.length && (
              <div className="invalid-feedback">{errors.length}</div>
            )}
          </div>
        </th>
        <th scope="col">
          <div className="form-group">
            <select
              className="custom-select"
              name="unit"
              defaultValue="碼"
              onChange={this.onChange}
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
              name="color"
              defaultValue="0"
              onChange={this.onChange}
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>
        </th>
        <th scope="col">
          <div className="form-group">
            <select
              className="custom-select"
              name="defect"
              defaultValue="無"
              onChange={this.onChange}
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
              onChange={this.onChange}
            />
          </div>
        </th>
      </tr>
    );
  }
}

export default ClothInfo;
