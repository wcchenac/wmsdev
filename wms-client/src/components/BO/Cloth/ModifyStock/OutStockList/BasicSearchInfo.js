import React, { Component } from "react";

class BasicSearchInfo extends Component {
  render() {
    return (
      <tr>
        <td>{this.props.searchInfo.productNo}</td>
        <td>{this.props.searchInfo.length}</td>
        <td>{this.props.searchInfo.unit}</td>
        <td>{this.props.searchInfo.user}</td>
      </tr>
    );
  }
}

export default BasicSearchInfo;
