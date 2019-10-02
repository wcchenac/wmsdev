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
                <th style={{ width: "20%" }}>型態</th>
                <th style={{ width: "20%" }}>長度</th>
                <th style={{ width: "15%" }}>單位</th>
                <th style={{ width: "15%" }}>缺陷</th>
                <th style={{ width: "30%" }}>註解</th>
              </tr>
            </thead>
            <tbody>
              {newClothInfoes.map((clothInfo, index) => (
                <TypeExchangeRequest
                  key={index}
                  index={index}
                  errors={clothInfo.errors}
                  onRequestChange={this.props.onRequestChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  render() {
    const { newClothInfoes } = this.props;
    let BoardContent = this.boardAlgorithm(newClothInfoes);

    return <div>{BoardContent}</div>;
  }
}
export default TypeExchangeRequestContainer;
