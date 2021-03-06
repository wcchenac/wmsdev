import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getStockInfoes,
  stockIdentifierIsShiped,
  stockIdentifiersAreShiped,
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
import { Button } from "react-bootstrap";
import BatchShipModal from "./BatchShipModal";
import ToolbarForNextPrev from "../../Utilities/ToolbarForNextPrev";
import { StockIdentifierType } from "../../../../../enums/Enums";

class ModifyBoard extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      isQuery: false,
      modalShow_BatchShip: false,
      modalShow_OutStock: false,
      productNo: "",
      prevProduct: "",
      nextProduct: "",
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
    this.handleShipList = this.handleShipList.bind(this);
    this.handleShrink = this.handleShrink.bind(this);
    this.handleStockInfoUpdate = this.handleStockInfoUpdate.bind(this);
    this.handleModalShow_BatchShip = this.handleModalShow_BatchShip.bind(this);
    this.handleModalClose_BatchShip = this.handleModalClose_BatchShip.bind(
      this
    );
    this.handleModalShow_OutStock = this.handleModalShow_OutStock.bind(this);
    this.handleModalClose_OutStock = this.handleModalClose_OutStock.bind(this);
    this.handleFutureProductQuery = this.handleFutureProductQuery.bind(this);
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

  handleFutureProductQuery(e) {
    e.preventDefault();
    let select = e.target.value;

    this.setState({ isLoading: true }, () => {
      this.props.getStockInfoes(select).then(response => {
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
          this.setState({ isLoading: false, modalShow_OutStock: false });
        }
      });
    });
  }

  handleShip(shipRequest) {
    this.setState({ isLoading: true }, () => {
      this.props.stockIdentifierIsShiped(shipRequest).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false, modalShow_BatchShip: false });
        }
      });
    });
  }

  handleShipList(shipRequests) {
    this.setState({ isLoading: true }, () => {
      this.props
        .stockIdentifiersAreShiped(this.state.productNo, shipRequests)
        .then(response => {
          this.setState({ isLoading: false, modalShow_BatchShip: false });
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

  handleModalClose_BatchShip() {
    this.setState({ modalShow_BatchShip: false });
  }

  handleModalShow_BatchShip() {
    this.setState({ modalShow_BatchShip: true });
  }

  handleModalClose_OutStock() {
    this.setState({ modalShow_OutStock: false });
  }

  handleModalShow_OutStock() {
    this.setState({ modalShow_OutStock: true });
  }

  infoSimplify() {
    const { stockInfoes } = this.state;
    let identifiers = [];

    stockInfoes.forEach(info => identifiers.push(info.stockIdentifier));

    return identifiers;
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.queryResult !== prevProps.queryResult &&
      this.props.queryResult.stockInfoes.information.productNo !== null
    ) {
      this.setState({
        productNo: this.props.queryResult.stockInfoes.information.productNo,
        prevProduct: this.props.queryResult.stockInfoes.prevProduct,
        nextProduct: this.props.queryResult.stockInfoes.nextProduct,
        productInfo: this.props.queryResult.stockInfoes.information,
        stockInfoes: this.props.queryResult.stockInfoes.result,
        stockQuantity: this.props.queryResult.stockInfoes.productList
      });
    }
  }

  contentAlgorithm() {
    const { isQuery, stockInfoes, stockQuantity } = this.state;

    if (!isQuery) {
      return null;
    } else {
      if (stockInfoes.length === 0) {
        return <QueryResponseWithNoStock />;
      } else {
        let typeValidation =
          stockInfoes[0].stockIdentifier.type === StockIdentifierType.hardware;

        return (
          <React.Fragment>
            <ShowProductQuantity stockQuantity={stockQuantity} />
            <br />
            <div className="row">
              <div className="col-md-auto mr-auto" />
              <div className="col-md-auto">
                <Button
                  variant="info"
                  size="sm"
                  onClick={this.handleModalShow_BatchShip}
                >
                  批量出庫
                </Button>
              </div>
              {this.state.modalShow_BatchShip ? (
                <BatchShipModal
                  show
                  handleModalClose={this.handleModalClose_BatchShip}
                  handleShipList={this.handleShipList}
                  typeValidation={typeValidation}
                  data={this.infoSimplify()}
                />
              ) : null}
            </div>
            <StockInfoContainer
              typeValidation={typeValidation}
              stockInfoes={stockInfoes}
              handleShip={this.handleShip}
              handleShrink={this.handleShrink}
              handleStockInfoUpdate={this.handleStockInfoUpdate}
            />
          </React.Fragment>
        );
      }
    }
  }

  render() {
    const {
      isLoading,
      isQuery,
      productNo,
      prevProduct,
      nextProduct,
      productInfo,
      stockInfoes
    } = this.state;
    let outStockRequestValidate =
      !isQuery ||
      productNo.toUpperCase() !== productInfo.productNo ||
      stockInfoes.length === 0 ||
      stockInfoes[0].stockIdentifier.type === StockIdentifierType.hardware;

    return (
      <div className="modify_stockInfo">
        <div className="container">
          <div className="row">
            <div className="col-md-auto">
              <QueryProductInformation
                productNo={productNo}
                onSubmit={this.onSubmit}
                onChange={this.onChange}
              />
            </div>
          </div>
          <hr />
          <LoadingOverlay active={isLoading} spinner={<Spinner />}>
            <div style={{ height: "80vh" }}>
              <div>
                <div className="row">
                  <div className="col-md-auto mr-2">
                    <ShowProductInformation
                      isBasic={false}
                      isQuery={isQuery}
                      productNo={productNo}
                      productInfo={productInfo}
                    />
                  </div>
                  <div className="col-md-auto mr-auto">
                    <Button
                      variant="primary"
                      disabled={outStockRequestValidate}
                      onClick={this.handleModalShow_OutStock}
                    >
                      拉貨要求
                    </Button>
                    {this.state.modalShow_OutStock ? (
                      <OutStockModal
                        show
                        handleModalClose={this.handleModalClose_OutStock}
                        productNo={productNo.toUpperCase()}
                        handleOutStockRequestSubmit={
                          this.handleOutStockRequestSubmit
                        }
                      />
                    ) : null}
                  </div>
                  <div className="col-md-auto">
                    <ToolbarForNextPrev
                      handleFutureProductQuery={this.handleFutureProductQuery}
                      prevProduct={prevProduct}
                      nextProduct={nextProduct}
                    />
                  </div>
                </div>
                <br />
                {this.contentAlgorithm()}
              </div>
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
  stockIdentifiersAreShiped: PropTypes.func.isRequired,
  stockIdentifierWaitToShrinkIsTrue: PropTypes.func.isRequired,
  createOutStockRequest: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  queryResult: state.stockInfo
});

export default connect(mapStateToProps, {
  getStockInfoes,
  stockIdentifierIsShiped,
  stockIdentifiersAreShiped,
  stockIdentifierWaitToShrinkIsTrue,
  createOutStockRequest,
  updateStockInfo
})(ModifyBoard);
