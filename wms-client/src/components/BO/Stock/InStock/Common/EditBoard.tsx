import React, { useRef, useEffect, memo, ReactNode, MouseEvent } from "react";
import StockInfoContainer from "./StockInfoContainer";
import { StockIdentifierType, DefectOption } from "../../../../../enums/Enums";

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

interface StockInfoData {
  productNo: string;
  lotNo: string;
  type: string;
  quantity: string;
  unit: string;
  color: string;
  defect: DefectOption[] | string;
  record: string;
  remark: string;
  inStockType: string;
  orderNo: string;
  directShip: boolean;
  outStockReason: string;
  errors: {
    quantity: string;
  };
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
    inStockRequests: StockInfoData[]
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

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Cleanup function to clear timeout and prevent memory leak
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const contentAlgorithm = (filterSubmittedList: SelectedProductNo[]): ReactNode => {
    const filterSelectedList = selectedProductNoList.filter(
      (object) => object.selected === true && object.isSubmitted === false
    );
    const filterSelectedListLength = filterSelectedList.length;
    const filterSubmittedListLength = filterSubmittedList.length;

    if (filterSelectedListLength === 0) {
      if (filterSubmittedListLength !== 0) {
        timerRef.current = setTimeout(getInitialize, 3000);

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
      <div className="row">
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
