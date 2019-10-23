import React, { Component } from "react";

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
              className="form-control"
              onChange={this.props.handleQueryChange}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            查詢
          </button>
        </div>
      </form>
    );
  }
}

export default QueryAssemble;
