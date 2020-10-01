import React, { Component } from "react";
import classnames from "classnames";

class QueryOrder extends Component {
  render() {
    const { type } = this.props;

    return (
      <div className="col-md-12">
        <form onSubmit={this.props.handleQueryOrderSubmit}>
          <div className="form-group row mb-0">
            <label className="col-md-auto col-form-label text-center">
              {type + "單號查詢"}
            </label>
            <div className="col-md-4">
              <input
                type="text"
                name="orderNo"
                placeholder={"請輸入" + type + "單號"}
                className={classnames("form-control", {
                  "is-invalid": this.props.isOrderValid === false,
                })}
                onChange={this.props.handleOrderNo}
              />
              {this.props.isOrderValid === false && (
                <div className="invalid-feedback">
                  {"查無" + type + " 或 " + type + "內沒有需要入庫的貨號"}
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
      </div>
    );
  }
}

export default QueryOrder;
