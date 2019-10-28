import React, { Component } from "react";

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
                  className="form-control"
                  onChange={this.props.handleStockOrderNo}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                查詢
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default QueryOrder;
