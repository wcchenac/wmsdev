import React, { Component } from "react";
import QueryClothInfo from "./QueryClothInfo";

class ShowQueryClothInfo extends Component {
  render() {
    const { clothInfoes } = this.props;

    return (
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
          </tr>
        </thead>
        <tbody>
          {clothInfoes.map(clothInfo => (
            <QueryClothInfo key={clothInfo.id} clothInfo={clothInfo} />
          ))}
        </tbody>
      </table>
    );
  }
}

export default ShowQueryClothInfo;
