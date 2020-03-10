import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getInStockRollbackList,
  inStockRollback
} from "../../../../../actions/StockAcions";
import { OrderType } from "../../../../../enums/Enums";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../../Others/Spinner";
import { isEmpty } from "../../../../../utilities/IsEmpty";
import StockInfoContainer from "./StockInfoContainer";

class InStockRollback extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      isQuery: false,
      orderNo: "",
      orderType: "",
      result: {}
    };
    this.handleOrderChange = this.handleOrderChange.bind(this);
    this.handleOrderQuerySubmit = this.handleOrderQuerySubmit.bind(this);
    this.handleInStockRollback = this.handleInStockRollback.bind(this);
  }

  handleOrderChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleOrderQuerySubmit(e) {
    e.preventDefault();

    this.setState({ isLoading: true }, () => {
      this.props
        .getInStockRollbackList(this.state.orderType, this.state.orderNo)
        .then(response => {
          if (response.status === 200) {
            this.setState({ isLoading: false, isQuery: true });
          }
        });
    });
  }

  handleInStockRollback(idList) {
    this.setState({ isLoading: true }, () => {
      this.props
        .inStockRollback(idList, this.state.orderType, this.state.orderNo)
        .then(response => {
          if (response.status === 200) {
            this.setState({ isLoading: false });
          }
        });
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.queryResult.stockInfoes !== prevProps.queryResult.stockInfoes
    ) {
      this.setState({
        result: this.props.queryResult.stockInfoes
      });
    }
  }

  contentAlgorithm() {
    const { isQuery, result } = this.state;

    if (!isQuery) {
      return null;
    } else {
      if (isEmpty(result)) {
        return (
          <div className="row justify-content-md-center">
            <div className="col-md-6">
              <div className="alert alert-warning" role="alert">
                <p className="h5 text-center mb-0">查無此單號資料</p>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <StockInfoContainer
            result={result}
            handleInStockRollback={this.handleInStockRollback}
          />
        );
      }
    }
  }

  render() {
    const { orderNo, orderType, isLoading } = this.state;

    return (
      <div className="container">
        <form onSubmit={this.handleOrderQuerySubmit}>
          <div className="form-group row mb-0">
            <label className="col-md-auto col-form-label text-center">
              進貨方式:
            </label>
            <div className="col-md-auto">
              <select
                className="custom-select"
                name="orderType"
                defaultValue=""
                onChange={this.handleOrderChange}
              >
                {Object.keys(OrderType).map((type, index) => (
                  <option key={index} value={OrderType[type]}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <label className="col-md-auto col-form-label text-center">
              單號:
            </label>
            <div className="col-md-auto">
              <input
                className="form-control"
                type="text"
                name="orderNo"
                placeholder="請輸入單號"
                disabled={this.state.orderType === ""}
                onChange={this.handleOrderChange}
              />
            </div>
            <div className="col-md-auto">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={orderType === "" || orderNo === ""}
              >
                查詢
              </button>
            </div>
          </div>
        </form>
        <hr />
        <LoadingOverlay active={isLoading} spinner={<Spinner />}>
          <div style={{ height: "70vh" }}>{this.contentAlgorithm()}</div>
        </LoadingOverlay>
      </div>
    );
  }
}

InStockRollback.propTypes = {
  getInStockRollbackList: PropTypes.func.isRequired,
  inStockRollback: PropTypes.func.isRequired,
  queryResult: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  queryResult: state.stockInfo
});

export default connect(mapStateToProps, {
  getInStockRollbackList,
  inStockRollback
})(InStockRollback);
