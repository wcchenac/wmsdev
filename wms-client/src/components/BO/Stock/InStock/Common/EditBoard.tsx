import React, { PureComponent } from "react";
import StockInfoContainer from "./StockInfoContainer";
import { StockIdentifierType } from "../../../../../enums/Enums";
import equal from "fast-deep-equal";
import type { SelectedProduct, StatusByProduct } from "../../../../../types/domain";
import type { InStockEditorRow } from "./StockInfo";

interface Props {
  isLoading: boolean;
  type: string;
  orderNo: string;
  selectedProductNoList: SelectedProduct[];
  waitHandleStatus: StatusByProduct;
  handlePrevStep: () => void;
  getInitialize: () => void;
  handleInStockRequestSubmit: (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number,
    inStockRequests: InStockEditorRow[]
  ) => void;
}

interface EditBoard {
  timer?: ReturnType<typeof setTimeout> | null;
}

class EditBoard extends PureComponent<Props> {

  contentAlgorithm(filterSubmittedList: SelectedProduct[]) {
    const { isLoading, selectedProductNoList, orderNo } = this.props;
    const filterSelectedList = selectedProductNoList.filter(
      (object) => object.selected === true && object.isSubmitted === false
    );
    const filterSelectedListLength = filterSelectedList.length;
    const filterSubmittedListLength = filterSubmittedList.length;

    if (filterSelectedListLength === 0) {
      if (filterSubmittedListLength !== 0) {
        this.timer = setTimeout(this.props.getInitialize, 3000);

        return (
          <div className="row justify-content-md-center">
            <div className="col-md-6">
              <div className="alert alert-success" role="alert">
                <h5 className="text-center">此次入庫作業已完成</h5>
                <h5 className="text-center">3秒後將跳回第一步...</h5>
              </div>
            </div>
          </div>
        );
      }
    } else {
      return (
        <div className="scrollbar-70">
          <nav>
            <div className="nav nav-tabs" id="nav-tab" role="tablist">
              {filterSelectedList.map((object, index) => {
                return (
                  <a
                    className={
                      index === 0
                        ? "nav-item nav-link active"
                        : "nav-item nav-link"
                    }
                    id={"nav-tab-" + object.index}
                    key={index}
                    data-toggle="tab"
                    href={"#nav-" + object.index}
                    role="tab"
                    aria-controls={"nav-" + object.index}
                    aria-selected={index === 0}
                  >
                    {object.productNo}
                  </a>
                );
              })}
            </div>
          </nav>
          <div className="tab-content" id="nav-tabContent">
            <br />
            {filterSelectedList.map((object, index) => {
              const typeValidation = equal(
                Object.keys(this.props.waitHandleStatus[object.productNo]).pop(),
                StockIdentifierType.hardware
              );

              return (
                <StockInfoContainer
                  isLoading={isLoading}
                  type={this.props.type}
                  typeValidation={typeValidation}
                  key={object.index}
                  sequence={index}
                  index={object.index}
                  orderNo={orderNo}
                  productNo={object.productNo}
                  waitHandleStatus={this.props.waitHandleStatus[object.productNo]}
                  handleInStockRequestSubmit={this.props.handleInStockRequestSubmit}
                />
              );
            })}
          </div>
        </div>
      );
    }
  }

  render() {
    const filterSubmittedList = this.props.selectedProductNoList.filter(
      (object) => object.isSubmitted === true
    );

    return (
      <div>
        <div className="row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.props.handlePrevStep}
            disabled={filterSubmittedList.length !== 0}
          >
            上一步
          </button>
        </div>
        <br />
        {this.contentAlgorithm(filterSubmittedList)}
      </div>
    );
  }
}

export default EditBoard;
