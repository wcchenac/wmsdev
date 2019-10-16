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
    const { clothInfo } = this.props;

    return (
      <tr>
        <td>
          <div className="form-group">
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
          <div className="form-group">
            <input
              type="text"
              className={classnames("form-control", {
                "is-invalid": errors.lotNo
              })}
              name="lotNo"
              placeholder="批號"
              value={clothInfo.lotNo}
              onChange={this.onChange}
            />
            {errors.lotNo && (
              <div className="invalid-feedback">{errors.lotNo}</div>
            )}
          </div>
        </td>
        <td>
          <div className="form-group">
            <select
              className="custom-select"
              name="type"
              defaultValue={clothInfo.type}
              onChange={this.onChange}
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
              onChange={this.onChange}
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
              defaultValue={clothInfo.unit}
              onChange={this.onChange}
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
              name="color"
              defaultValue={clothInfo.color}
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
        </td>
        <td>
          <div className="form-group">
            <select
              className="custom-select"
              name="defect"
              defaultValue={clothInfo.defect}
              onChange={this.onChange}
            >
              <option value="無">無</option>
              <option value="GA">GA</option>
              <option value="GB">GB</option>
              <option value="GC">GC</option>
              <option value="GD">GD</option>
            </select>
          </div>
        </td>
        <td>
          <div className="form-group">
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
