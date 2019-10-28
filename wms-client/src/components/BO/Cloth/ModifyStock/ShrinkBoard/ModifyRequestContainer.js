import React, { Component } from "react";
import ModifyRequest from "./ModifyRequest";

class ModifyRequestContainer extends Component {
  render() {
    const { newClothInfoes } = this.props;

    if (newClothInfoes === null || newClothInfoes.length < 1) {
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
                <th style={{ width: "15%" }}>長度</th>
                <th style={{ width: "15%" }}>單位</th>
                <th style={{ width: "25%" }}>瑕疵</th>
                <th style={{ width: "25%" }}>註解</th>
              </tr>
            </thead>
            <tbody>
              {newClothInfoes.map((clothInfo, index) => (
                <ModifyRequest
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
}

export default ModifyRequestContainer;
