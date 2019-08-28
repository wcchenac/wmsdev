import React, { Component } from "react";
import { Link } from "react-router-dom";

class ClothInfo extends Component {
  render() {
    const { clothInfo } = this.props;
    const { clothIdentifier } = this.props.clothInfo;

    return (
      <tr>
        <th scope="col">{clothIdentifier.productNo}</th>
        <th scope="col">{clothIdentifier.lotNo}</th>
        <th scope="col">{clothIdentifier.type}</th>
        <th scope="col">{clothIdentifier.length}</th>
        <th scope="col">{clothIdentifier.serialNo}</th>
        <th scope="col">{clothInfo.color}</th>
        <th scope="col">{clothInfo.defect}</th>
        <th scope="col">
          <Link
            to={{
              pathname: `/cloth/2/${clothInfo.id}`,
              state: { clothInfo: this.props.clothInfo }
            }}
            className="btn btn-primary"
            role="button"
          >
            查看/修改
          </Link>
        </th>
      </tr>
    );
  }
}

export default ClothInfo;
