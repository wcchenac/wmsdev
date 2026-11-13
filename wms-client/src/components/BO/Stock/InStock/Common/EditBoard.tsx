import React, { useEffect, useState, memo, ReactNode, MouseEvent } from "react";
import { InStockRequest } from "../../../../../types";
import StockInfoContainer from "./StockInfoContainer";
import { StockIdentifierType } from "../../../../../enums/Enums";

import equal from "fast-deep-equal";

interface WaitHandleStatusItem {
  quantity: string | number;
  unit: string;
}

interface WaitHandleStatus {
  [productNo: string]: {
    [type: string]: WaitHandleStatusItem;
  };
}

interface SelectedProductNo {
  productNo: string;
  selected: boolean;
  index: number;
  isSubmitted: boolean;
}


interface EditBoardProps {
  isLoading: boolean;
  selectedProductNoList: SelectedProductNo[];
  orderNo: string;
  type: string;
  waitHandleStatus: WaitHandleStatus;
  getInitialize: () => void;
  handleInStockRequestSubmit: (
    e: MouseEvent<HTMLButtonElement>,
    index: number,
    inStockRequests: InStockRequest[]
  ) => void;
  handlePrevStep: () => void;
}

const EditBoard: React.FC<EditBoardProps> = memo(function EditBoard(props: EditBoardProps) {
  const {
    isLoading,
    selectedProductNoList,
    orderNo,
    type,
    waitHandleStatus,
    getInitialize,
    handleInStockRequestSubmit,
    handlePrevStep,
  } = props;

  // Product tab currently shown, keyed by SelectedProductNo.index.
  const [activeTabIndex, setActiveTabIndex] = useState<number | null>(null);

  // Every ticked product has been submitted: show the completion message and go back to
  // Step 1 after 3 seconds. The timer lives in an effect so re-renders do not add more timers,
  // and it is cleared if the board goes away first.
  const isCompleted =
    selectedProductNoList.some((object) => object.isSubmitted === true) &&
    !selectedProductNoList.some((object) => object.selected === true && object.isSubmitted === false);

  useEffect(() => {
    if (!isCompleted) {
      return undefined;
    }
    const timer = setTimeout(getInitialize, 3000);
    return () => clearTimeout(timer);
  }, [isCompleted, getInitialize]);

  const contentAlgorithm = (filterSubmittedList: SelectedProductNo[]): ReactNode => {
    const filterSelectedList = selectedProductNoList.filter(
      (object) => object.selected === true && object.isSubmitted === false
    );
    const filterSelectedListLength = filterSelectedList.length;
    const filterSubmittedListLength = filterSubmittedList.length;

    if (filterSelectedListLength === 0) {
      if (filterSubmittedListLength !== 0) {
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
      // Fall back to the first tab when nothing is chosen yet or the chosen product was submitted.
      const currentTab = filterSelectedList.some((object) => object.index === activeTabIndex)
        ? activeTabIndex
        : filterSelectedList[0].index;

      return (
        <div className="scrollbar-70">
          <nav>
            <div className="nav nav-tabs" id="nav-tab" role="tablist">
              {filterSelectedList.map((object, index) => {
                return (
                  <a
                    className={
                      object.index === currentTab
                        ? "nav-item nav-link active"
                        : "nav-item nav-link"
                    }
                    id={"nav-tab-" + object.index}
                    key={index}
                    href={"#nav-" + object.index}
                    role="tab"
                    aria-controls={"nav-" + object.index}
                    aria-selected={object.index === currentTab}
                    onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      setActiveTabIndex(object.index);
                    }}
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
                Object.keys(waitHandleStatus[object.productNo]).pop(),
                StockIdentifierType.hardware
              );

              return (
                <StockInfoContainer
                  isLoading={isLoading}
                  type={type}
                  typeValidation={typeValidation}
                  key={object.index}
                  sequence={index}
                  active={object.index === currentTab}
                  index={object.index}
                  orderNo={orderNo}
                  productNo={object.productNo}
                  waitHandleStatus={waitHandleStatus[object.productNo]}
                  handleInStockRequestSubmit={handleInStockRequestSubmit}
                />
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const filterSubmittedList = selectedProductNoList.filter(
    (object) => object.isSubmitted === true
  );

  return (
    <div>
      <div className="d-flex">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handlePrevStep}
          disabled={filterSubmittedList.length !== 0}
        >
          上一步
        </button>
      </div>
      <br />
      {contentAlgorithm(filterSubmittedList)}
    </div>
  );
});

export default EditBoard;
