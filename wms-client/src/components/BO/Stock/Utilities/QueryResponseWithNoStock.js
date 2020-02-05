import React, { Component } from "react";

class QueryResponseWithNoStock extends Component {
  render() {
    return (
      <div className="row justify-content-md-center">
        <div className="col-md-6">
          <div className="alert alert-warning" role="alert">
            <p className="h5 text-center mb-0">
              查無此貨號資料 或 此貨號已無庫存
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default QueryResponseWithNoStock;
