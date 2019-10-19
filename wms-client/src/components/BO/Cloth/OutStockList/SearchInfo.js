import React, { Component } from "react";

class SearchInfo extends Component {
  render() {
    const { handled } = this.props.searchInfo;

    return (
      <tr className={handled ? "table-secondary" : ""}>
        <td>
          <input type="checkbox" />
        </td>
        <td>{this.props.searchInfo.productNo}</td>
        <td>{this.props.searchInfo.type}</td>
        <td>{this.props.searchInfo.length}</td>
        <td>{this.props.searchInfo.unit}</td>
        <td>{this.props.searchInfo.reason}</td>
        <td>{this.props.searchInfo.createdBy}</td>
      </tr>
    );
  }
}

export default SearchInfo;
