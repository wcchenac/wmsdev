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
      isLoading: false,
      shrinkList: [],
      stockInfo: {},
      typeExchange: false,
      sameTypeModify: false,
      hardwareModify: false
    };
    this.queryShrinkList = this.queryShrinkList.bind(this);
    this.onModifyClick = this.onModifyClick.bind(this);
    this.handleModifyRequestSubmit = this.handleModifyRequestSubmit.bind(this);
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
      isLoading: false,
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

  queryShrinkList() {
    this.setState({ isLoading: true }, () => {
      this.props.getShrinkList().then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  handleModifyRequestSubmit(shrinkStockRequest) {
    this.setState({ isLoading: true }, () => {
      this.props
        .batchCreateStockInfoesForShrink(shrinkStockRequest)
        .then(res => {
          if (res.status === 200) {
            this.initialComponent();
          }
        })
        .catch(err => console.log(err));
    });
  }

  onCancelShrinkClick(stockIdentifierId) {
    this.setState({ isLoading: true }, () => {
      this.props
        .stockIdentifierWaitToShrinkIsFalse(stockIdentifierId)
        .then(response => {
          if (response.status === 200) {
            this.setState({ isLoading: false });
          }
        });
    });
  }

  render() {
    const {
      isLoading,
      shrinkList,
      stockInfo,
      typeExchange,
      sameTypeModify,
      hardwareModify
    } = this.state;

    return typeExchange || sameTypeModify || hardwareModify ? (
      <ModifyRequestBoard
        isLoading={isLoading}
        stockInfo={stockInfo}
        typeExchange={typeExchange}
        sameTypeModify={sameTypeModify}
        hardwareModify={hardwareModify}
        handleGoBack={this.handleGoBack}
        handleModifyRequestSubmit={this.handleModifyRequestSubmit}
        initialComponent={this.initialComponent}
      />
    ) : (
      <ShrinkList
        isLoading={isLoading}
        shrinkList={shrinkList}
        queryShrinkList={this.queryShrinkList}
        onModifyClick={this.onModifyClick}
        onCancelShrinkClick={this.onCancelShrinkClick}
      />
    );
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
