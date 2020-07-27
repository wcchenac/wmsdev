import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getStockInfoesBasic } from "../../../../actions/StockAcions";
import StockInfoContainer from "./Common/StockInfoContainer";
import QueryProductInformation from "../Utilities/QueryProductInformation";
import ShowProductInformation from "../Utilities/ShowProductInformation";
import QueryResponseWithNoStock from "../Utilities/QueryResponseWithNoStock";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import ShowProductQuantity from "../Utilities/ShowProductQuantity";
import ToolbarForNextPrev from "../Utilities/ToolbarForNextPrev";
import { StockIdentifierType } from "../../../../enums/Enums";

class QueryBoard extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      isQuery: false,
      productNo: "",
      prevProduct: "",
      nextProduct: "",
      productInfo: {},
      stockInfoes: [],
      stockQuantity: {},
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleFutureProductQuery = this.handleFutureProductQuery.bind(this);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();

    this.setState({ isLoading: true }, () => {
      this.props.getStockInfoesBasic(this.state.productNo).then((response) => {
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
      this.props.getStockInfoesBasic(select).then((response) => {
        if (response.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.stockInfo.stockInfoes !== prevProps.stockInfo.stockInfoes &&
      this.props.stockInfo.stockInfoes.information.productNo !== null
    ) {
      this.setState({
        productNo: this.props.stockInfo.stockInfoes.information.productNo,
        prevProduct: this.props.stockInfo.stockInfoes.prevProduct,
        nextProduct: this.props.stockInfo.stockInfoes.nextProduct,
        productInfo: this.props.stockInfo.stockInfoes.information,
        stockInfoes: this.props.stockInfo.stockInfoes.result,
        stockQuantity: this.props.stockInfo.stockInfoes.productList,
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
        return (
          <React.Fragment>
            <ShowProductQuantity stockQuantity={stockQuantity} />
            <br />
            <StockInfoContainer
              typeValidation={
                stockQuantity[0].type === StockIdentifierType.hardware
              }
              stockInfoes={stockInfoes}
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
    } = this.state;

    return (
      <div className="query_stockInfo">
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
                  <div className="col-md-auto mr-auto">
                    <ShowProductInformation
                      isBasic={true}
                      isQuery={isQuery}
                      productNo={productNo}
                      productInfo={productInfo}
                    />
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

QueryBoard.propTypes = {
  stockInfo: PropTypes.object.isRequired,
  getStockInfoesBasic: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  stockInfo: state.stockInfo,
});

export default connect(mapStateToProps, {
  getStockInfoesBasic,
})(QueryBoard);
