import React, { PureComponent } from "react";
import ShrinkInfoContainer from "./ShrinkInfoContainer";
import { trackPromise } from "react-promise-tracker";

const refreshTime = 1000 * 60 * 10;

class ShrinkList extends PureComponent {
  componentDidMount() {
    this.apiCall = setInterval(() => {
      trackPromise(this.props.getShrinkList());
    }, refreshTime);
  }

  componentWillUnmount() {
    clearInterval(this.apiCall);
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
