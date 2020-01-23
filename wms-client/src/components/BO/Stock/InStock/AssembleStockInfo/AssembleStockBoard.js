import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import QueryOrder from "../Common/QueryOrder";
import StockInfoContainer from "./StockInfoContainer";
import {
  getAssembleOrder,
  batchCreateStockInfoes
} from "../../../../../actions/StockAcions";
import { checkWaitHandleStatusCompletion } from "../../Utilities/ValidateQueryOrderResponse";
import { isEmpty } from "../../../../../utilities/IsEmpty";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../../Others/Spinner";

class AssembleStockBoard extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      isOrderValid: undefined,
      isSubmited: false,
      orderNo: "",
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
    this.setState({ isLoading: true, isOrderValid: undefined }, () => {
      this.props.getAssembleOrder(this.state.orderNo).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  handleAssembleRequestSubmit(inStockRequests) {
    this.setState({ isLoading: true }, () => {
      this.props
        .batchCreateStockInfoes(inStockRequests)
        .then(res => {
          this.setState({ isLoading: false, isSubmited: true });
          return res;
        })
        .catch(err => {
          this.setState({ isLoading: false, isSubmited: false });
          return err;
        });
    });
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
      isLoading,
      isOrderValid,
      isSubmited,
      orderNo,
      assembleOrderContent,
      waitHandleStatus
    } = this.state;

    return (
      <div className="assemble_stockInfo">
        <div className="container">
          <LoadingOverlay active={isLoading} spinner={<Spinner />}>
            <QueryOrder
              type="組裝單"
              isOrderValid={isOrderValid}
              handleOrderNo={this.handleQueryChange}
              handleQueryOrderSubmit={this.handleQuerySubmit}
            />
            <hr />
            <div style={{ height: "80vh" }}>
              {isOrderValid ? (
                <StockInfoContainer
                  isSubmited={isSubmited}
                  assembleOrderNo={orderNo}
                  assembleOrderContent={assembleOrderContent}
                  waitHandleStatus={waitHandleStatus}
                  handleAssembleRequestSubmit={this.handleAssembleRequestSubmit}
                  getInitialize={this.getInitialize}
                />
              ) : null}
            </div>
          </LoadingOverlay>
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
