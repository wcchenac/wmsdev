import React, { Component } from "react";
import ShrinkInfo from "./ShrinkInfo";

class ShrinkInfoContainer extends Component {
  render() {
    const { shrinkList } = this.props;

    const boardAlgorithm = shrinkList => {
      if (shrinkList === null || shrinkList.length < 1) {
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
                  <th scope="col">單位</th>
                  <th scope="col">流水號</th>
                  <th scope="col">色號</th>
                  <th scope="col">缺陷</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {shrinkList.map(clothInfo => (
                  <ShrinkInfo
                    key={clothInfo.id}
                    clothInfo={clothInfo}
                    onTypeExchangeClick={this.props.onTypeExchangeClick}
                    onSameTypeClick={this.props.onSameTypeClick}
                    onCancelShrinkClick={this.props.onCancelShrinkClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    };

    let BoardContent;
    BoardContent = boardAlgorithm(shrinkList);

    return <div>{BoardContent}</div>;
  }
}

export default ShrinkInfoContainer;
