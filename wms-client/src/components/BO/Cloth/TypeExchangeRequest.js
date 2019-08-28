import React, { Component } from "react";

class TypeExchangeRequest extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onRequestChange(e, this.props.index);
  }

  render() {
    return (
      <tr>
        <th scope="col">
          <div className="form-group">
            <select
              className="form-control"
              name="type"
              defaultValue="板"
              onChange={this.handleChange}
            >
              <option value="捲">捲</option>
              <option value="板">板</option>
            </select>
          </div>
        </th>
        <th scope="col">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="長度"
              name="length"
              onChange={this.handleChange}
            />
          </div>
        </th>
        <th scope="col">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="色號"
              name="color"
              onChange={this.handleChange}
            />
          </div>
        </th>
        <th scope="col">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="缺陷"
              name="defect"
              onChange={this.handleChange}
            />
          </div>
        </th>
        <th scope="col">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="記錄"
              name="record"
              onChange={this.handleChange}
            />
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
