import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getStockInfoes,
  stockIndentifierIsShiped,
  stockIdentifierWaitToShrinkIsTrue,
  createOutStockRequest,
  updateStockInfo
} from "../../../../../actions/StockAcions";
import StockInfoContainer from "./StockInfoContainer";
import QueryProductInformation from "../../Utilities/QueryProductInformation";
import ShowProductInformation from "../../Utilities/ShowProductInformation";
import OutStockModal from "./OutStockModal";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../../Others/Spinner";

const equal = require("fast-deep-equal");

class ModifyBoard extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      isQuery: false,
      productNo: "",
      productInfo: {},
      stockInfoes: []
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleOutStockRequestSubmit = this.handleOutStockRequestSubmit.bind(
      this
    );
    this.handleShip = this.handleShip.bind(this);
    this.handleShrink = this.handleShrink.bind(this);
    this.handleStockInfoUpdate = this.handleStockInfoUpdate.bind(this);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();
    this.setState({ isLoading: true }, () => {
      this.props.getStockInfoes(this.state.productNo).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  handleOutStockRequestSubmit(e, outStockRequest) {
    e.preventDefault();
    this.setState({ isLoading: true }, () => {
      this.props.createOutStockRequest(outStockRequest).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  handleShip(shipRequest) {
    this.setState({ isLoading: true }, () => {
      this.props.stockIndentifierIsShiped(shipRequest).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  handleShrink(id) {
    this.setState({ isLoading: true }, () => {
      this.props.stockIdentifierWaitToShrinkIsTrue(id).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  handleStockInfoUpdate(updateInfoRequest) {
    this.setState({ isLoading: true }, () => {
      this.props.updateStockInfo(updateInfoRequest).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (!equal(this.props.queryResult, prevProps.queryResult)) {
      this.setState({
        productInfo: this.props.queryResult.stockInfoes.information,
        stockInfoes: this.props.queryResult.stockInfoes.result
      });
    }
  }

  render() {
    const {
      isLoading,
      isQuery,
      productNo,
      productInfo,
      stockInfoes
    } = this.state;

    return (
      <div className="modify_stockInfo">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <QueryProductInformation
                productNo={productNo}
                onSubmit={this.onSubmit}
                onChange={this.onChange}
              />
            </div>
            <div className="col-md-auto mr-2">
              <ShowProductInformation
                isBasic={false}
                isQuery={isQuery}
                productNo={productNo}
                productInfo={productInfo}
              />
            </div>
            <div className="col-md-auto">
              <button
                className="btn btn-primary"
                disabled={
                  !isQuery ||
                  productNo.toUpperCase() !== productInfo.productNo ||
                  stockInfoes.length === 0 ||
                  stockInfoes[0].stockIdentifier.type === "雜項"
                }
                data-toggle="modal"
                data-target="#outStockRequest"
              >
                拉貨要求
              </button>
              {productNo.toUpperCase() !== productInfo.productNo ? null : (
                <OutStockModal
                  productNo={productNo.toUpperCase()}
                  handleOutStockRequestSubmit={this.handleOutStockRequestSubmit}
                />
              )}
            </div>
          </div>
          <hr />
          <LoadingOverlay active={isLoading} spinner={<Spinner />}>
            <div style={{ height: "80vh" }}>
              {isQuery ? (
                stockInfoes.length === 0 ? (
                  <div className="row justify-content-md-center">
                    <div className="col-md-6">
                      <div className="alert alert-warning" role="alert">
                        <p className="h5 text-center mb-0">
                          查無此貨號資料 或 此貨號已無庫存
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <StockInfoContainer
                    typeValidation={
                      stockInfoes[0].stockIdentifier.type === "雜項"
                    }
                    stockInfoes={stockInfoes}
                    handleShip={this.handleShip}
                    handleShrink={this.handleShrink}
                    handleStockInfoUpdate={this.handleStockInfoUpdate}
                  />
                )
              ) : null}
            </div>
          </LoadingOverlay>
        </div>
      </div>
    );
  }
}

ModifyBoard.propTypes = {
  queryResult: PropTypes.object.isRequired,
  getStockInfoes: PropTypes.func.isRequired,
  stockIndentifierIsShiped: PropTypes.func.isRequired,
  stockIdentifierWaitToShrinkIsTrue: PropTypes.func.isRequired,
  createOutStockRequest: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  queryResult: state.stockInfo
});

export default connect(mapStateToProps, {
  getStockInfoes,
  stockIndentifierIsShiped,
  stockIdentifierWaitToShrinkIsTrue,
  createOutStockRequest,
  updateStockInfo
})(ModifyBoard);
