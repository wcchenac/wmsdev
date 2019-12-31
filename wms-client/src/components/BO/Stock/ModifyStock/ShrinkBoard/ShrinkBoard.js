import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getShrinkList,
  stockIdentifierWaitToShrinkIsFalse,
  batchCreateStockInfoesForShrink
} from "../../../../../actions/StockAcions";
import ShrinkList from "./ShrinkList";
import ModifyRequestBoard from "./ModifyRequestBoard";

class ShrinkBoard extends Component {
  constructor() {
    super();
    this.state = {
      shrinkList: [],
      stockInfo: {},
      typeExchange: false,
      sameTypeModify: false,
      hardwareModify: false
    };
    // this.onSameTypeClick = this.onSameTypeClick.bind(this);
    // this.onTypeExchangeClick = this.onTypeExchangeClick.bind(this);
    // this.onHardwareModifyClick = this.onHardwareModifyClick.bind(this);
    this.onModifyClick = this.onModifyClick.bind(this);
    this.onCancelShrinkClick = this.onCancelShrinkClick.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
    this.initialComponent = this.initialComponent.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.shrinkList !== prevProps.shrinkList) {
      this.setState({ shrinkList: this.props.shrinkList.stockInfoes });
    }
  }

  initialComponent() {
    this.setState({
      shrinkList: [],
      stockInfo: {},
      typeExchange: false,
      sameTypeModify: false,
      hardwareModify: false
    });
  }

  handleGoBack() {
    this.setState({ typeExchange: false, sameTypeModify: false });
  }

  onModifyClick(type, stockInfo) {
    this.setState({ [type]: true, stockInfo: stockInfo });
  }

  // onTypeExchangeClick(stockInfo) {
  //   this.setState({ typeExchange: true, stockInfo: stockInfo });
  // }

  // onSameTypeClick(stockInfo) {
  //   this.setState({ sameTypeModify: true, stockInfo: stockInfo });
  // }

  // onHardwareModifyClick(stockInfo) {
  //   this.setState({ hardwareModify: true, stockInfo: stockInfo });
  // }

  onCancelShrinkClick(stockIdentifierId) {
    this.props.stockIdentifierWaitToShrinkIsFalse(stockIdentifierId);
  }

  render() {
    const {
      shrinkList,
      stockInfo,
      typeExchange,
      sameTypeModify,
      hardwareModify
    } = this.state;

    if (typeExchange || sameTypeModify || hardwareModify) {
      return (
        <ModifyRequestBoard
          stockInfo={stockInfo}
          typeExchange={typeExchange}
          sameTypeModify={sameTypeModify}
          hardwareModify={hardwareModify}
          handleGoBack={this.handleGoBack}
          batchCreateStockInfoesForShrink={
            this.props.batchCreateStockInfoesForShrink
          }
          initialComponent={this.initialComponent}
        />
      );
    } else {
      return (
        <ShrinkList
          shrinkList={shrinkList}
          getShrinkList={this.props.getShrinkList}
          // onTypeExchangeClick={this.onTypeExchangeClick}
          // onSameTypeClick={this.onSameTypeClick}
          // onHardwareModifyClick={this.onHardwareModifyClick}
          onModifyClick={this.onModifyClick}
          onCancelShrinkClick={this.onCancelShrinkClick}
        />
      );
    }
  }
}

ShrinkBoard.propTypes = {
  shrinkList: PropTypes.object.isRequired,
  getShrinkList: PropTypes.func.isRequired,
  stockIdentifierWaitToShrinkIsFalse: PropTypes.func.isRequired,
  batchCreateStockInfoesForShrink: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  shrinkList: state.stockInfo
});

export default connect(mapStateToProps, {
  getShrinkList,
  stockIdentifierWaitToShrinkIsFalse,
  batchCreateStockInfoesForShrink
})(ShrinkBoard);
