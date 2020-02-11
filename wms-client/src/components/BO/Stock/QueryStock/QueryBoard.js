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

class QueryBoard extends Component {
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
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();

    this.setState({ isLoading: true }, () => {
      this.props.getStockInfoesBasic(this.state.productNo).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.stockInfo.stockInfoes !== prevProps.stockInfo.stockInfoes) {
      this.setState({
        productInfo: this.props.stockInfo.stockInfoes.information,
        stockInfoes: this.props.stockInfo.stockInfoes.result,
        stockQuantity: this.props.stockInfo.stockInfoes.productList
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
              typeValidation={stockQuantity[0].type === "雜項"}
              stockInfoes={stockInfoes}
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
      <div className="query_stockInfo">
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
                isBasic={true}
                isQuery={isQuery}
                productNo={productNo}
                productInfo={productInfo}
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

QueryBoard.propTypes = {
  stockInfo: PropTypes.object.isRequired,
  getStockInfoesBasic: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  stockInfo: state.stockInfo
});

export default connect(mapStateToProps, {
  getStockInfoesBasic
})(QueryBoard);
