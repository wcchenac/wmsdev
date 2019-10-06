import React, { Component } from "react";
import ShrinkInfoContainer from "./ShrinkInfoContainer";

class ShrinkList extends Component {
  componentDidMount() {
    this.props.getShrinkList();
  }

  render() {
    return (
      <div className="shrink_list">
        <div className="container">
          <p className="h3 text-center">待減肥清單</p>
          <hr />
          <ShrinkInfoContainer
            shrinkList={this.props.shrinkList}
            onTypeExchangeClick={this.props.onTypeExchangeClick}
            onSameTypeClick={this.props.onSameTypeClick}
            onCancelShrinkClick={this.props.onCancelShrinkClick}
          />
        </div>
      </div>
    );
  }
}

export default ShrinkList;
