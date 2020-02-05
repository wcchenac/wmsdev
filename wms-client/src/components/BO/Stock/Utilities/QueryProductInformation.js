import React, { Component } from "react";

class QueryProductInformation extends Component {
  render() {
    return (
      <React.Fragment>
        <form onSubmit={this.props.onSubmit}>
          <div className="form-group row">
            <label className="col-md-auto col-form-label text-center">
              貨號查詢
            </label>
            <div className="col-md-8">
              <input
                type="text"
                name="productNo"
                placeholder="請輸入貨號"
                className="form-control"
                value={this.props.productNo}
                onChange={this.props.onChange}
              />
            </div>
            <div className="col-md-auto">
              <button type="submit" className="btn btn-primary">
                查詢
              </button>
            </div>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

export default QueryProductInformation;
