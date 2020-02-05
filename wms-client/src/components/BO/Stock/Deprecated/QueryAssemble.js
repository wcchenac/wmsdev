import React, { Component } from "react";
import classnames from "classnames";

class QueryAssemble extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleQuerySubmit}>
        <div className="form-group row">
          <label className="col-md-auto col-form-label text-center">
            組裝單單號查詢
          </label>
          <div className="col-md-4">
            <input
              type="text"
              name="assembleOrderNo"
              placeholder="請輸入組裝單單號"
              className={classnames("form-control", {
                "is-invalid": this.props.isOrderValid === false
              })}
              onChange={this.props.handleQueryChange}
            />
            {this.props.isOrderValid === false && (
              <div className="invalid-feedback">
                查無組裝單 或 組裝單內沒有需要入庫的貨號
              </div>
            )}
          </div>
          <div className="col-md-auto">
            <button type="submit" className="btn btn-primary">
              查詢
            </button>
          </div>
        </div>
      </form>
    );
  }
}

export default QueryAssemble;
