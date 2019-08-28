import React, { Component } from "react";
import ClothInfo from "./ClothInfo";

class ShowClothInfo extends Component {
  render() {
    const { clothInfoes } = this.props;

    let BoardContent;

    const boardAlgorithm = clothInfoes => {
      if (clothInfoes.length < 1) {
        return (
          <div className="alert alert-warning text-center" role="alert">
            查無資料
          </div>
        );
      } else {
        return (
          <div>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th scope="col">貨號</th>
                  <th scope="col">批號</th>
                  <th scope="col">型態</th>
                  <th scope="col">長度</th>
                  <th scope="col">流水號</th>
                  <th scope="col">色碼</th>
                  <th scope="col">缺陷</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {clothInfoes.map(clothInfo => (
                  <ClothInfo key={clothInfo.id} clothInfo={clothInfo} />
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    };
    BoardContent = boardAlgorithm(clothInfoes);
    return <div>{BoardContent}</div>;
  }
}

export default ShowClothInfo;
