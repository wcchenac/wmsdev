import React, { Component } from "react";
import TypeExchangeRequest from "./TypeExchangeRequest";

class TypeExchangeRequestContainer extends Component {
  boardAlgorithm(newClothInfoes) {
    if (newClothInfoes.length < 1) {
      return (
        <div className="alert alert-warning text-center" role="alert">
          請新增資料
        </div>
      );
    } else {
      return (
        <div>
          <table className="table">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "25%" }}>型態</th>
                <th style={{ width: "20%" }}>長度</th>
                <th style={{ width: "15%" }}>單位</th>
                <th style={{ width: "25%" }}>瑕疵</th>
                <th style={{ width: "25%" }}>註解</th>
              </tr>
            </thead>
            <tbody>
              {newClothInfoes.map((clothInfo, index) => (
                <TypeExchangeRequest
                  key={index}
                  index={index}
                  clothInfo={clothInfo}
                  onRequestChange={this.props.onRequestChange}
                  handleDefectChange={this.props.handleDefectChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  render() {
    let BoardContent = this.boardAlgorithm(this.props.newClothInfoes);

    return <div>{BoardContent}</div>;
  }
}
export default TypeExchangeRequestContainer;
