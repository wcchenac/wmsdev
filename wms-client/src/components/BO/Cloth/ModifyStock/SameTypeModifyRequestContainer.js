import React, { Component } from "react";
import SameTypeModifyRequest from "./SameTypeModifyRequest";

class SameTypeModifyRequestContainer extends Component {
  render() {
    const { newClothInfoes } = this.props;

    const boardAlgorithm = newClothInfoes => {
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
              <thead>
                <tr>
                  <th scope="col">型態</th>
                  <th scope="col">長度</th>
                  <th scope="col">單位</th>
                  <th scope="col">缺陷</th>
                  <th scope="col">註解</th>
                </tr>
              </thead>
              <tbody>
                {newClothInfoes.map((clothInfo, index) => (
                  <SameTypeModifyRequest
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
    };

    let BoardContent;
    BoardContent = boardAlgorithm(newClothInfoes);

    return <div>{BoardContent}</div>;
  }
}
export default SameTypeModifyRequestContainer;
