import React, { Component } from "react";
import ClothInfo from "./ClothInfo";

class ClothInfoContainer extends Component {
  render() {
    const { clothInfoes } = this.props;

    const boardAlgorithm = clothInfoes => {
      if (clothInfoes === null || clothInfoes.length < 1) {
        return (
          <div className="alert alert-warning text-center" role="alert">
            查無資料
          </div>
        );
      } else {
        return (
          <div className="table-wrapper-scroll-y my-custom-scrollbar">
            <table className="table table-hover">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">貨號</th>
                  <th scope="col">批號</th>
                  <th scope="col">型態</th>
                  <th scope="col">長度</th>
                  <th scope="col">單位</th>
                  <th scope="col">色號</th>
                  <th scope="col">缺陷</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {clothInfoes.map((clothInfo, index) => (
                  <ClothInfo
                    key={clothInfo.id}
                    index={index}
                    clothInfo={clothInfo}
                    handleShip={this.props.handleShip}
                    handleShrink={this.props.handleShrink}
                  />
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    };

    let BoardContent;
    BoardContent = boardAlgorithm(clothInfoes);

    return <div>{BoardContent}</div>;
  }
}

export default ClothInfoContainer;
