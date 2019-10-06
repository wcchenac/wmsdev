import React, { Component } from "react";

class ClothInfo extends Component {
  render() {
    const { clothInfo } = this.props;
    const { clothIdentifier } = this.props.clothInfo;

    return (
      <tr className={clothIdentifier.waitToShrink ? "table-warning" : ""}>
        <td>{clothIdentifier.productNo}</td>
        <td>{clothIdentifier.lotNo}</td>
        <td>{clothIdentifier.type}</td>
        <td>{clothIdentifier.length}</td>
        <td>{clothIdentifier.unit}</td>
        <td>{clothInfo.color}</td>
        <td>{clothInfo.defect}</td>
      </tr>
    );
  }
}

export default ClothInfo;
