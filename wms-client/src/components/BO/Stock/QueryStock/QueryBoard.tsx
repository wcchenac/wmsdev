import React, { Component } from "react";
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
import type { RootState } from "../../../../types/state";
import type {
  ApiStatus,
  ProductInformation,
  ProductQuantity,
  ProductQueryPayload,
  StoredStockInfo,
} from "../../../../types/domain";

interface StateProps {
  stockInfo: {
    stockInfoes: ProductQueryPayload;
  };
}

interface DispatchProps {
  getStockInfoesBasic: (productNo: string) => Promise<ApiStatus | undefined>;
}

type Props = StateProps & DispatchProps;

interface State {
  isLoading: boolean;
  isQuery: boolean;
  productNo: string;
  prevProduct: string | null;
  nextProduct: string | null;
  productInfo: ProductInformation;
  stockInfoes: StoredStockInfo[];
  stockQuantity: ProductQuantity[];
}

class QueryBoard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      isQuery: false,
      productNo: "",
      prevProduct: "",
      nextProduct: "",
      productInfo: {} as ProductInformation,
      stockInfoes: [],
      stockQuantity: {} as ProductQuantity[],
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleFutureProductQuery = this.handleFutureProductQuery.bind(this);
  }

  onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.name === "productNo") {
      this.setState({ productNo: e.target.value });
    }
  }

  onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    this.setState({ isLoading: true }, () => {
      this.props.getStockInfoesBasic(this.state.productNo).then((response) => {
        if (response?.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  handleFutureProductQuery(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const select = (e.target as HTMLButtonElement).value;

    this.setState({ isLoading: true }, () => {
      this.props.getStockInfoesBasic(select).then((response) => {
        if (response?.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  componentDidUpdate(prevProps: Props) {
    const payload = this.props.stockInfo.stockInfoes;
    if (
      payload !== prevProps.stockInfo.stockInfoes &&
      payload.information!.productNo !== null
    ) {
      this.setState({
        productNo: payload.information!.productNo as string,
        prevProduct: payload.prevProduct ?? null,
        nextProduct: payload.nextProduct ?? null,
        productInfo: payload.information!,
        stockInfoes: payload.result ?? [],
        stockQuantity: payload.productList ?? [],
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

const mapStateToProps = (state: RootState): StateProps => ({
  stockInfo: state.stockInfo as unknown as StateProps["stockInfo"],
});

export default connect(mapStateToProps, {
  getStockInfoesBasic,
})(QueryBoard);
