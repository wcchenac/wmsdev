import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getShrinkRollbackList,
  shrinkRollback
} from "../../../../../actions/StockAcions";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../../Others/Spinner";
import QueryProductInformation from "../../../Stock/Utilities/QueryProductInformation";
import StockInfoContainer from "./StockInfoContainer";

import type { RootState } from "../../../../../types/state";
import type { ApiStatus } from "../../../../../types/domain";
import type { ShrinkHistoryNode } from "./StockInfo";

interface QuerySlice {
  stockInfoes: ShrinkHistoryNode[];
}

interface StateProps {
  queryResult: QuerySlice;
}

interface DispatchProps {
  getShrinkRollbackList: (productNo: string) => Promise<ApiStatus | undefined>;
  shrinkRollback: (stockIdentifierId: number, productNo: string) => Promise<ApiStatus | undefined>;
}

type Props = StateProps & DispatchProps;

interface State {
  isLoading: boolean;
  isQuery: boolean;
  productNo: string;
  result: ShrinkHistoryNode[];
}


class ShrinkRollback extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      isQuery: false,
      productNo: "",
      result: []
    };
    this.handleProductNoChange = this.handleProductNoChange.bind(this);
    this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
    this.handleShrinkRollback = this.handleShrinkRollback.bind(this);
  }

  handleProductNoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.name === "productNo") {
      this.setState({ productNo: e.target.value });
    }
  }

  handleQuerySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    this.setState({ isLoading: true }, () => {
      this.props.getShrinkRollbackList(this.state.productNo).then(response => {
        if (response?.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  handleShrinkRollback(stockIdentifierId: number) {
    this.setState({ isLoading: true }, () => {
      this.props
        .shrinkRollback(stockIdentifierId, this.state.productNo)
        .then(response => {
          if (response?.status === 200) {
            this.setState({ isLoading: false });
          }
        });
    });
  }

  contentAlgorithm() {
    const { isQuery, result } = this.state;

    if (!isQuery) {
      return null;
    } else {
      if (result.length === 0) {
        return (
          <div className="row justify-content-md-center">
            <div className="col-md-6">
              <div className="alert alert-warning" role="alert">
                <p className="h5 text-center mb-0">查無此貨號資料</p>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <StockInfoContainer
            result={result}
            handleShrinkRollback={this.handleShrinkRollback}
          />
        );
      }
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props.queryResult.stockInfoes !== prevProps.queryResult.stockInfoes
    ) {
      this.setState({
        result: this.props.queryResult.stockInfoes as ShrinkHistoryNode[]
      });
    }
  }

  render() {
    const { isLoading, productNo } = this.state;

    return (
      <div className="container">
        <div className="row mb-0">
          <div className="col-auto">
            <QueryProductInformation
              productNo={productNo}
              onSubmit={this.handleQuerySubmit}
              onChange={this.handleProductNoChange}
            />
          </div>
          <div className="col-md-auto">
            <button className="btn-customize" disabled>
              <small className="text-muted">預設查詢最近五筆</small>
            </button>
          </div>
        </div>
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
  getShrinkRollbackList,
  shrinkRollback
})(ShrinkRollback);
