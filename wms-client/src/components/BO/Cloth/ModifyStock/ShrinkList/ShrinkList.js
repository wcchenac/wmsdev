import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getShrinkList,
  clothIdentifierWaitToShrinkIsFalse
} from "../../../../../actions/ClothInfoAcions";
import ShrinkInfoContainer from "./ShrinkInfoContainer";

class ShrinkList extends Component {
  constructor() {
    super();
    this.state = {
      shrinkList: []
    };
    this.onSameTypeClick = this.onSameTypeClick.bind(this);
    this.onTypeExchangeClick = this.onTypeExchangeClick.bind(this);
    this.onCancelShrinkClick = this.onCancelShrinkClick.bind(this);
  }

  componentDidMount() {
    this.props.getShrinkList();
  }

  componentDidUpdate(prevProps) {
    if (this.props.clothInfo !== prevProps.clothInfo) {
      this.setState({ shrinkList: this.props.clothInfo.clothInfoes });
    }
  }

  onTypeExchangeClick(clothInfo) {
    this.props.history.push({
      pathname: `/cloth/4/2/1/${clothInfo.id}`,
      state: { clothInfo: clothInfo }
    });
  }

  onSameTypeClick(clothInfo) {
    this.props.history.push({
      pathname: `/cloth/4/2/2/${clothInfo.id}`,
      state: { clothInfo: clothInfo }
    });
  }

  onCancelShrinkClick(clothIdentifierId) {
    this.props.clothIdentifierWaitToShrinkIsFalse(clothIdentifierId);
  }

  render() {
    const { shrinkList } = this.state;

    return (
      <div className="shrink_list">
        <div className="container">
          <p className="h3 text-center">待減肥清單</p>
          <hr />
          <ShrinkInfoContainer
            shrinkList={shrinkList}
            onTypeExchangeClick={this.onTypeExchangeClick}
            onSameTypeClick={this.onSameTypeClick}
            onCancelShrinkClick={this.onCancelShrinkClick}
          />
        </div>
      </div>
    );
  }
}

ShrinkList.propTypes = {
  clothInfo: PropTypes.object.isRequired,
  getShrinkList: PropTypes.func.isRequired,
  clothIdentifierWaitToShrinkIsFalse: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  clothInfo: state.clothInfo
});

export default connect(
  mapStateToProps,
  { getShrinkList, clothIdentifierWaitToShrinkIsFalse }
)(ShrinkList);
