import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import QueryAssemble from "./QueryAssemble";
import ClothInfoContainer from "./ClothInfoContainer";
import {
  getAssembleOrder,
  batchCreateClothInfoes
} from "../../../../../actions/ClothInfoAcions";
import { isEmpty } from "../../../../../utilities/IsEmpty";

class AssembleClothBoard extends Component {
  constructor() {
    super();
    this.state = {
      isOrderValid: undefined,
      assembleOrderNo: "",
      assembleOrderContent: {},
      waitHandleStatus: {}
    };
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
    this.handleAssembleRequestSubmit = this.handleAssembleRequestSubmit.bind(
      this
    );
    this.getInitialize = this.getInitialize.bind(this);
  }

  getInitialize() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }

    this.setState({
      isOrderValid: undefined,
      assembleOrderContent: {},
      waitHandleStatus: {}
    });
  }

  handleQueryChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleQuerySubmit(e) {
    e.preventDefault();
    this.setState({ isOrderValid: undefined });
    this.props.getAssembleOrder(this.state.assembleOrderNo);
  }

  handleAssembleRequestSubmit(inStockRequests) {
    return this.props.batchCreateClothInfoes(inStockRequests);
  }

  checkWaitHandleStatus(waitHandleStatus) {
    let quantityValid = true;

    // check there is any length equals 0 in waitHandleStatus
    // if there is a type which is not equal 0, return false; otherwise, return true
    Object.keys(waitHandleStatus).forEach(productNo => {
      Object.keys(waitHandleStatus[productNo]).forEach(type => {
        if (parseFloat(waitHandleStatus[productNo][type].length) !== 0.0) {
          quantityValid = false;

          return quantityValid;
        }
      });
    });

    return quantityValid;
  }

  componentDidUpdate(prevProps) {
    if (this.props.assembleOrderContent !== prevProps.assembleOrderContent) {
      this.setState(
        {
          assembleOrderContent: this.props.assembleOrderContent.clothInfoes
            .currentStatus,
          waitHandleStatus: this.props.assembleOrderContent.clothInfoes
            .waitHandleStatus
        },
        function() {
          if (
            isEmpty(this.state.assembleOrderContent) ||
            this.checkWaitHandleStatus(this.state.waitHandleStatus)
          ) {
            this.setState({ isOrderValid: false });
          } else {
            this.setState({ isOrderValid: true });
          }
        }
      );
    }
  }

  render() {
    const {
      isOrderValid,
      assembleOrderContent,
      waitHandleStatus
    } = this.state;

    return (
      <div className="assemble_clothInfo">
        <div className="container">
          <QueryAssemble
            isOrderValid={isOrderValid}
            handleQueryChange={this.handleQueryChange}
            handleQuerySubmit={this.handleQuerySubmit}
          />
          <hr />
          {isOrderValid ? (
            <ClothInfoContainer
              assembleOrderContent={assembleOrderContent}
              waitHandleStatus={waitHandleStatus}
              handleAssembleRequestSubmit={this.handleAssembleRequestSubmit}
              getInitialize={this.getInitialize}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

AssembleClothBoard.propTypes = {
  assembleOrderContent: PropTypes.object.isRequired,
  batchCreateClothInfoes: PropTypes.func.isRequired,
  getAssembleOrder: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  assembleOrderContent: state.clothInfo
});

export default connect(mapStateToProps, {
  getAssembleOrder,
  batchCreateClothInfoes
})(AssembleClothBoard);
