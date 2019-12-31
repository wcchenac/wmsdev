import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import QueryAssemble from "./QueryAssemble";
import StockInfoContainer from "./StockInfoContainer";
import {
  getAssembleOrder,
  batchCreateStockInfoes
} from "../../../../../actions/StockAcions";
import { checkWaitHandleStatusCompletion } from "../../Utilities/ValidateQueryOrderResponse";
import { isEmpty } from "../../../../../utilities/IsEmpty";

class AssembleStockBoard extends Component {
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
    return this.props.batchCreateStockInfoes(inStockRequests);
  }

  componentDidUpdate(prevProps) {
    if (this.props.assembleOrderContent !== prevProps.assembleOrderContent) {
      this.setState(
        {
          assembleOrderContent: this.props.assembleOrderContent.stockInfoes
            .currentStatus,
          waitHandleStatus: this.props.assembleOrderContent.stockInfoes
            .waitHandleStatus
        },
        function() {
          if (
            isEmpty(this.state.assembleOrderContent) ||
            checkWaitHandleStatusCompletion(this.state.waitHandleStatus)
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
      assembleOrderNo,
      assembleOrderContent,
      waitHandleStatus
    } = this.state;

    return (
      <div className="assemble_stockInfo">
        <div className="container">
          <QueryAssemble
            isOrderValid={isOrderValid}
            handleQueryChange={this.handleQueryChange}
            handleQuerySubmit={this.handleQuerySubmit}
          />
          <hr />
          {isOrderValid ? (
            <StockInfoContainer
              assembleOrderNo={assembleOrderNo}
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

AssembleStockBoard.propTypes = {
  assembleOrderContent: PropTypes.object.isRequired,
  batchCreateStockInfoes: PropTypes.func.isRequired,
  getAssembleOrder: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  assembleOrderContent: state.stockInfo
});

export default connect(mapStateToProps, {
  getAssembleOrder,
  batchCreateStockInfoes
})(AssembleStockBoard);
