import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getStockInfoes,
  stockIdentifierIsShiped,
  stockIdentifierWaitToShrinkIsTrue,
  createOutStockRequest,
  updateStockInfo
} from "../../../../../actions/StockAcions";
import StockInfoContainer from "./StockInfoContainer";
import QueryProductInformation from "../../Utilities/QueryProductInformation";
import ShowProductInformation from "../../Utilities/ShowProductInformation";
import OutStockModal from "./OutStockModal";
import QueryResponseWithNoStock from "../../Utilities/QueryResponseWithNoStock";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../../Others/Spinner";
import ShowProductQuantity from "../../Utilities/ShowProductQuantity";

const equal = require("fast-deep-equal");

class ModifyBoard extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      isQuery: false,
      productNo: "",
      productInfo: {},
      stockInfoes: [],
      stockQuantity: {}
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

  handleOutStockRequestSubmit(outStockRequest) {
    this.setState({ isLoading: true }, () => {
      this.props.createOutStockRequest(outStockRequest).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  handleShip(shipRequest) {
    this.setState({ isLoading: true }, () => {
      this.props.stockIdentifierIsShiped(shipRequest).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  handleShrink(id) {
    this.setState({ isLoading: true }, () => {
      this.props.stockIdentifierWaitToShrinkIsTrue(id).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  handleStockInfoUpdate(updateInfoRequest) {
    this.setState({ isLoading: true }, () => {
      this.props.updateStockInfo(updateInfoRequest).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (!equal(this.props.queryResult, prevProps.queryResult)) {
      this.setState({
        productInfo: this.props.queryResult.stockInfoes.information,
        stockInfoes: this.props.queryResult.stockInfoes.result,
        stockQuantity: this.props.queryResult.stockInfoes.productList
      });
    }
  }

  contentAlgorithm(isQuery, stockInfoes, stockQuantity) {
    if (!isQuery) {
      return null;
    } else {
      if (stockInfoes.length === 0) {
        return <QueryResponseWithNoStock />;
      } else {
        return (
          <div>
            <ShowProductQuantity stockQuantity={stockQuantity} />
            <hr />
            <StockInfoContainer
              typeValidation={stockInfoes[0].stockIdentifier.type === "雜項"}
              stockInfoes={stockInfoes}
              handleShip={this.handleShip}
              handleShrink={this.handleShrink}
              handleStockInfoUpdate={this.handleStockInfoUpdate}
            />
          </div>
        );
      }
    }
  }

  render() {
    const {
      isLoading,
      isQuery,
      productNo,
      productInfo,
      stockInfoes,
      stockQuantity
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
              <OutStockModal
                productNo={productNo.toUpperCase()}
                handleOutStockRequestSubmit={this.handleOutStockRequestSubmit}
              />
            </div>
          </div>
          <hr />
          <LoadingOverlay active={isLoading} spinner={<Spinner />}>
            <div style={{ height: "80vh" }}>
              {this.contentAlgorithm(isQuery, stockInfoes, stockQuantity)}
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
  stockIdentifierIsShiped: PropTypes.func.isRequired,
  stockIdentifierWaitToShrinkIsTrue: PropTypes.func.isRequired,
  createOutStockRequest: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  queryResult: state.stockInfo
});

export default connect(mapStateToProps, {
  getStockInfoes,
  stockIdentifierIsShiped,
  stockIdentifierWaitToShrinkIsTrue,
  createOutStockRequest,
  updateStockInfo
})(ModifyBoard);
