import React, { Component } from "react";
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

import type { RootState } from "../../../../../types/state";
import type { ApiStatus, StoredStockInfo } from "../../../../../types/domain";

interface QuerySlice {
  stockInfoes: Record<string, StoredStockInfo[]>;
}

interface StateProps {
  queryResult: QuerySlice;
}

interface DispatchProps {
  getInStockRollbackList: (orderType: string, orderNo: string) => Promise<ApiStatus | undefined>;
  inStockRollback: (
    idList: number[],
    orderType: string,
    orderNo: string
  ) => Promise<ApiStatus | undefined>;
}

type Props = StateProps & DispatchProps;

interface State {
  isLoading: boolean;
  isQuery: boolean;
  orderNo: string;
  orderType: string;
  result: Record<string, StoredStockInfo[]>;
}


class InStockRollback extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
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

  handleOrderChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === "orderNo") {
      this.setState({ orderNo: value });
    } else if (name === "orderType") {
      this.setState({ orderType: value });
    }
  }

  handleOrderQuerySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    this.setState({ isLoading: true }, () => {
      this.props
        .getInStockRollbackList(this.state.orderType, this.state.orderNo)
        .then(response => {
          if (response?.status === 200) {
            this.setState({ isLoading: false, isQuery: true });
          }
        });
    });
  }

  handleInStockRollback(idList: number[]) {
    this.setState({ isLoading: true }, () => {
      this.props
        .inStockRollback(idList, this.state.orderType, this.state.orderNo)
        .then(response => {
          if (response?.status === 200) {
            this.setState({ isLoading: false });
          }
        });
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props.queryResult.stockInfoes !== prevProps.queryResult.stockInfoes
    ) {
      this.setState({
        result: this.props.queryResult.stockInfoes as Record<string, StoredStockInfo[]>
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
                  <option key={index} value={(OrderType as Record<string, string>)[type]}>
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


const mapStateToProps = (state: RootState): StateProps => ({
  queryResult: state.stockInfo as unknown as QuerySlice
});

export default connect(mapStateToProps, {
  getInStockRollbackList,
  inStockRollback
})(InStockRollback);
