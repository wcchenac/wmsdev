import React, { Component } from "react";

class QueryAssemble extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    this.props.handleQueryChange(e);
  }

  onSubmit(e) {
    this.props.handleQuerySubmit(e);
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
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
              onChange={this.onChange}
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
