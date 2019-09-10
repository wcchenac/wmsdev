import React, { Component } from "react";
import { Link } from "react-router-dom";

class ClothInfo extends Component {
  onClick() {
    if (window.confirm("確認出貨？")) {
      this.props.handleShip(this.props.clothInfo.clothIdentifier.id);
    }
  }

  render() {
    const { clothInfo } = this.props;
    const { clothIdentifier } = this.props.clothInfo;

    return (
      <tr>
        <th scope="col">{clothIdentifier.productNo}</th>
        <th scope="col">{clothIdentifier.lotNo}</th>
        <th scope="col">{clothIdentifier.type}</th>
        <th scope="col">{clothIdentifier.length}</th>
        <th scope="col">{clothIdentifier.unit}</th>
        <th scope="col">{clothIdentifier.serialNo}</th>
        <th scope="col">{clothInfo.color}</th>
        <th scope="col">{clothInfo.defect}</th>
        <th scope="col">
          <div
            className="btn-toolbar"
            role="toolbar"
            aria-label="Toolbar with button groups"
          >
            <div
              className="btn-group mr-2"
              role="group"
              aria-label="First group"
            >
              <Link
                to={{
                  pathname: `/cloth/3/${clothInfo.id}`,
                  state: { clothInfo: this.props.clothInfo }
                }}
                className="btn btn-primary"
                role="button"
              >
                查看/修改
              </Link>
            </div>
            <div className="btn-group" role="group" aria-label="Second group">
              <button
                className="btn btn-primary"
                onClick={this.onClick.bind(this)}
              >
                出貨
              </button>
            </div>
          </div>
        </th>
      </tr>
    );
  }
}

export default ClothInfo;
