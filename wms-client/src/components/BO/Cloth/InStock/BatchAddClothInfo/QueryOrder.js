import React, { Component } from "react";
import classnames from "classnames";

class QueryOrder extends Component {
  render() {
    return (
      <div>
        <div className="col-md-12">
          <form onSubmit={this.props.handleQueryOrderSubmit}>
            <div className="form-group row">
              <label className="col-md-auto col-form-label text-center">
                進貨單單號查詢
              </label>
              <div className="col-md-4">
                <input
                  type="text"
                  name="inStockOrderNo"
                  placeholder="請輸入進貨單單號"
                  className={classnames("form-control", {
                    "is-invalid": this.props.isOrderValid === false
                  })}
                  onChange={this.props.handleStockOrderNo}
                />
                {this.props.isOrderValid === false && (
                  <div className="invalid-feedback">
                    查無進貨單 或 進貨單內沒有需要入庫的貨號
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
      </div>
    );
  }
}

export default QueryOrder;
