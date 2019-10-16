import React, { Component } from "react";
import OutStockRequest from "./OutStockRequest";

class OutStockRequestContainer extends Component {
  boardAlgorithm(outStockRequests) {
    if (outStockRequests.length < 1) {
      return (
        <div className="alert alert-warning text-center" role="alert">
          請新增資料
        </div>
      );
    } else {
      return (
        <div>
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "34%" }}>貨號</th>
                <th style={{ width: "22%" }}>型態</th>
                <th style={{ width: "22%" }}>長度</th>
                <th style={{ width: "22%" }}>單位</th>
              </tr>
            </thead>
            <tbody>
              {outStockRequests.map((request, index) => (
                <OutStockRequest
                  key={index}
                  index={index}
                  errors={request.errors}
                  handleRequestChange={this.props.handleRequestChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  render() {
    const { outStockRequests } = this.props;
    let BoardContent = this.boardAlgorithm(outStockRequests);

    return <div>{BoardContent}</div>;
  }
}

export default OutStockRequestContainer;
