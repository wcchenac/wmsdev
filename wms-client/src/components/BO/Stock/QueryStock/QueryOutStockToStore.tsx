import React, { Component } from "react";
import { connect } from "react-redux";
import { getOutStockToStoreOrder } from "../../../../actions/StockAcions";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import QueryOrder from "../InStock/Common/QueryOrder";
import { isEmpty } from "../../../../utilities/IsEmpty";

import type { RootState } from "../../../../types/state";
import type { ApiStatus, ProductInformation } from "../../../../types/domain";

interface OrderSlice {
  stockInfoes: ProductInformation[] | Record<string, never>;
}

interface StateProps {
  orderInfo: OrderSlice;
}

interface DispatchProps {
  getOutStockToStoreOrder: (orderNo: string) => Promise<ApiStatus | undefined>;
}

type Props = StateProps & DispatchProps;

interface State {
  isLoading: boolean;
  isQuery: boolean;
  orderNo: string;
  orderInfoes: ProductInformation[];
  isOrderValid: boolean | undefined;
}


class QueryOutStockToStore extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      isQuery: false,
      orderNo: "",
      orderInfoes: [],
      isOrderValid: undefined,
    };
    this.handleOrderNo = this.handleOrderNo.bind(this);
    this.handleQueryOrderSubmit = this.handleQueryOrderSubmit.bind(this);
  }

  handleOrderNo(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.name === "orderNo") {
      this.setState({ orderNo: e.target.value });
    }
  }

  handleQueryOrderSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    this.setState({ isLoading: true }, () => {
      this.props
        .getOutStockToStoreOrder(this.state.orderNo)
        .then((response) => {
          if (response?.status === 200) {
            this.setState({ isLoading: false, isQuery: true });
          }
        });
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.orderInfo !== prevProps.orderInfo) {
      this.setState(
        { orderInfoes: this.props.orderInfo.stockInfoes as ProductInformation[] },
        function (this: QueryOutStockToStore) {
          if (isEmpty(this.state.orderInfoes)) {
            this.setState({ isOrderValid: false });
          } else {
            this.setState({ isOrderValid: true });
          }
        }
      );
    }
  }

  render() {
    const { isLoading, isQuery, orderInfoes, isOrderValid } = this.state;

    return (
      <div className="query_outStockToStore">
        <div className="container">
          <div className="row">
            <QueryOrder
              type="出庫單"
              handleOrderNo={this.handleOrderNo}
              handleQueryOrderSubmit={this.handleQueryOrderSubmit}
              isOrderValid={isOrderValid}
            />
          </div>
          <hr />
          <LoadingOverlay active={isLoading} spinner={<Spinner />}>
            <div style={{ height: "80vh" }}>
              {!isQuery ? null : (
                <div className="table-wrapper-scroll-y scrollbar-70">
                  <table className="table table-sm table-hover">
                    <thead className="thead-dark">
                      <tr>
                        <th style={{ width: "15%" }}>貨號</th>
                        <th style={{ width: "25%" }}>品名</th>
                        <th style={{ width: "25%" }}>大牌品名</th>
                        <th style={{ width: "25%" }}>規格</th>
                        <th style={{ width: "10%" }}>基重</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderInfoes.map((productInfo) => {
                        return (
                          <React.Fragment>
                            <tr>
                              <td> {productInfo.productNo}</td>
                              <td> {productInfo.cName}</td>
                              <td> {productInfo.cCCCODE}</td>
                              <td> {productInfo.spec}</td>
                              <td> {productInfo.packDesc}</td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </LoadingOverlay>
        </div>
      </div>
    );
  }
}


const mapStateToProps = (state: RootState): StateProps => ({
  orderInfo: state.stockInfo as unknown as OrderSlice,
});

export default connect(mapStateToProps, {
  getOutStockToStoreOrder,
})(QueryOutStockToStore);
