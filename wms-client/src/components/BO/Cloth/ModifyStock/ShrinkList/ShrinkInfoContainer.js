import React, { Component } from "react";
import ShrinkInfo from "./ShrinkInfo";

class ShrinkInfoContainer extends Component {
  boardAlgorithm(shrinkList) {
    if (shrinkList === null || shrinkList.length < 1) {
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
                <th style={{ width: "220px" }}>貨號</th>
                <th style={{ width: "90px" }}>批號</th>
                <th style={{ width: "100px" }}>型態</th>
                <th style={{ width: "100px" }}>長度</th>
                <th style={{ width: "82px" }}>單位</th>
                <th style={{ width: "82px" }}>色號</th>
                <th style={{ width: "82px" }}>缺陷</th>
                <th style={{ width: "115px" }} />
                <th style={{ width: "115px" }} />
                <th style={{ width: "115px" }} />
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
  }

  render() {
    const { shrinkList } = this.props;
    let BoardContent = this.boardAlgorithm(shrinkList);

    return <div>{BoardContent}</div>;
  }
}

export default ShrinkInfoContainer;
