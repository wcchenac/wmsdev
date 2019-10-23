import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getShrinkList,
  clothIdentifierWaitToShrinkIsFalse,
  batchCreateClothInfoesForShrink
} from "../../../../../actions/ClothInfoAcions";
import ShrinkList from "./ShrinkList";
import ModifyRequestBoard from "./ModifyRequestBoard";

class ShrinkBoard extends Component {
  constructor() {
    super();
    this.state = {
      shrinkList: [],
      clothInfo: {},
      typeExchange: false,
      sameTypeModify: false
    };
    this.onSameTypeClick = this.onSameTypeClick.bind(this);
    this.onTypeExchangeClick = this.onTypeExchangeClick.bind(this);
    this.onCancelShrinkClick = this.onCancelShrinkClick.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
    this.initialComponent = this.initialComponent.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.shrinkList !== prevProps.shrinkList) {
      this.setState({ shrinkList: this.props.shrinkList });
    }
  }

  initialComponent() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }

    this.setState({
      shrinkList: [],
      clothInfo: {},
      typeExchange: false,
      sameTypeModify: false
    });
  }

  handleGoBack() {
    this.setState({ typeExchange: false, sameTypeModify: false });
  }

  onTypeExchangeClick(clothInfo) {
    this.setState({ typeExchange: true, clothInfo: clothInfo });
  }

  onSameTypeClick(clothInfo) {
    this.setState({ sameTypeModify: true, clothInfo: clothInfo });
  }

  onCancelShrinkClick(clothIdentifierId) {
    this.props.clothIdentifierWaitToShrinkIsFalse(clothIdentifierId);
  }

  render() {
    const { shrinkList, clothInfo, typeExchange, sameTypeModify } = this.state;

    if (typeExchange || sameTypeModify) {
      return (
        <ModifyRequestBoard
          clothInfo={clothInfo}
          typeExchange={typeExchange}
          sameTypeModify={sameTypeModify}
          handleGoBack={this.handleGoBack}
          batchCreateClothInfoesForShrink={
            this.props.batchCreateClothInfoesForShrink
          }
          initialComponent={this.initialComponent}
        />
      );
    } else {
      return (
        <ShrinkList
          shrinkList={shrinkList}
          getShrinkList={this.props.getShrinkList}
          onTypeExchangeClick={this.onTypeExchangeClick}
          onSameTypeClick={this.onSameTypeClick}
          onCancelShrinkClick={this.onCancelShrinkClick}
        />
      );
    }
  }
}

ShrinkBoard.propTypes = {
  shrinkList: PropTypes.object.isRequired,
  getShrinkList: PropTypes.func.isRequired,
  clothIdentifierWaitToShrinkIsFalse: PropTypes.func.isRequired,
  batchCreateClothInfoesForShrink: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  shrinkList: state.clothInfo.clothInfoes
});

export default connect(
  mapStateToProps,
  {
    getShrinkList,
    clothIdentifierWaitToShrinkIsFalse,
    batchCreateClothInfoesForShrink
  }
)(ShrinkBoard);
