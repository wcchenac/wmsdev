import React, { Component, FormEvent } from "react";
import { connect, ConnectedProps } from "react-redux";
import {
  getShrinkRollbackList,
  shrinkRollback
} from "../../../../../actions/StockActions";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../../Others/Spinner";
import QueryProductInformation, { ProductNoChange } from "../../../Stock/Utilities/QueryProductInformation";
import StockInfoContainer from "./StockInfoContainer";
import { RootState, ShrinkRollbackObject } from "../../../../../types";
import { notifyRequestFailed } from "../../../../../utilities/notifyRequestFailed";
import { notifyRollbackFailed } from "../../../../../utilities/rollbackRequest";

interface ShrinkRollbackState {
  isLoading: boolean;
  isQuery: boolean;
  productNo: string;
  result: ShrinkRollbackObject[];
}

const mapStateToProps = (state: RootState) => ({
  queryResult: state.stockInfo
});

const mapDispatchToProps = {
  getShrinkRollbackList,
  shrinkRollback
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

class ShrinkRollback extends Component<PropsFromRedux, ShrinkRollbackState> {
  constructor(props: PropsFromRedux) {
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

  handleProductNoChange(e: ProductNoChange): void {
    if (e.target.name === "productNo") {
      this.setState({ productNo: e.target.value });
    }
  }

  handleQuerySubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    this.setState({ isLoading: true }, () => {
      this.props.getShrinkRollbackList(this.state.productNo).then((response: { status: number }) => {
        if (response.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      }).catch((error: unknown) => {
        this.setState({ isLoading: false });
        notifyRequestFailed(error);
      });
    });
  }

  handleShrinkRollback(stockIdentifierId: number): void {
    this.setState({ isLoading: true }, () => {
      // The action queries the list again whatever the outcome; a failure says what happened.
      this.props
        .shrinkRollback(stockIdentifierId, this.state.productNo)
        .catch(notifyRollbackFailed)
        .finally(() => {
          this.setState({ isLoading: false });
        });
    });
  }

  contentAlgorithm(): React.ReactNode {
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

  componentDidUpdate(prevProps: PropsFromRedux): void {
    if (
      this.props.queryResult.stockInfoes !== prevProps.queryResult.stockInfoes
    ) {
      this.setState({
        result: this.props.queryResult.stockInfoes as ShrinkRollbackObject[]
      });
    }
  }

  render(): React.ReactNode {
    const { isLoading, productNo } = this.state;

    return (
      <div className="container">
        <div className="row mb-0">
          <div className="col-auto">
            <QueryProductInformation
              productNo={productNo}
              onSubmit={this.handleQuerySubmit}
              onChange={this.handleProductNoChange}
              isLoading={isLoading}
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

export default connector(ShrinkRollback);
