import React, { Component } from "react";

class QueryClothInfo extends Component {
  render() {
    const { clothIdentifier } = this.props.clothInfo;
    const { clothInfo } = this.props;
    return (
      <tr>
        <th scope="col">{clothIdentifier.productNo}</th>
        <th scope="col">{clothIdentifier.lotNo}</th>
        <th scope="col">{clothIdentifier.type}</th>
        <th scope="col">{clothIdentifier.length}</th>
        <th scope="col">{clothIdentifier.serialNo}</th>
        <th scope="col">{clothInfo.color}</th>
        <th scope="col">{clothInfo.defect}</th>
      </tr>
    );
  }
}

export default QueryClothInfo;
