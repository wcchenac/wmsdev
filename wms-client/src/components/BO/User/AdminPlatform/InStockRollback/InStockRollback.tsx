import React, { useState, useCallback, ChangeEvent, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { notifyRequestFailed } from "../../../../../utilities/notifyRequestFailed";
import { notifyRollbackFailed, RollbackError } from "../../../../../utilities/rollbackRequest";
import { useUpdateEffect } from "../../../../../utilities/useUpdateEffect";
import { useSubmitLock } from "../../../../../utilities/useSubmitLock";
import {
  getInStockRollbackList,
  inStockRollback
} from "../../../../../actions/StockActions";
import { OrderType } from "../../../../../enums/Enums";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { Spinner } from "../../../../Others/Spinner";
import { isEmpty } from "../../../../../utilities/IsEmpty";
import StockInfoContainer from "./StockInfoContainer";
import { Alert } from "../../../../UI";
import { RootState, InStockRollbackResult, AppDispatch } from "../../../../../types";

const InStockRollback: React.FC = () => {
  const { isLocked: isLoading, runLocked } = useSubmitLock();
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const [orderNo, setOrderNo] = useState<string>("");
  const [orderType, setOrderType] = useState<string>("");
  const [result, setResult] = useState<InStockRollbackResult>({});
  // The order the list on screen belongs to. A rollback and its refresh use this, not the
  // search inputs, which the admin may have changed since.
  const [queriedOrder, setQueriedOrder] = useState<{ orderType: string; orderNo: string }>({
    orderType: "",
    orderNo: "",
  });

  const dispatch = useDispatch<AppDispatch>();
  const queryResult = useSelector((state: RootState) => state.stockInfo);

  // Only react to a result that arrives while this page is mounted, not one another page
  // left in the shared stockInfo slice (componentDidUpdate in dev).
  useUpdateEffect(queryResult.inStockRollbackList, (result) => {
    if (result) {
      setResult(result as InStockRollbackResult);
    }
  });

  const handleOrderChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "orderNo") {
      setOrderNo(value);
    } else if (name === "orderType") {
      setOrderType(value);
    }
  }, []);

  const handleOrderQuerySubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      void runLocked(() =>
        dispatch(getInStockRollbackList(orderType, orderNo))
          .then((response: { status: number }) => {
            if (response.status === 200) {
              setIsQuery(true);
              setQueriedOrder({ orderType, orderNo });
            }
          })
          .catch((error) => {
            notifyRequestFailed(error);
          })
      );
    },
    [dispatch, orderType, orderNo, runLocked]
  );

  const handleInStockRollback = useCallback(
    (idList: number[]): Promise<boolean> =>
      runLocked(() =>
        // The action queries the list again whatever the outcome; a failure says what happened.
        dispatch(inStockRollback(idList, queriedOrder.orderType, queriedOrder.orderNo))
          .then(() => true)
          .catch((error) => {
            notifyRollbackFailed(error);
            return error instanceof RollbackError && error.rolledBack;
          })
      ).then((res) => Boolean(res)),
    [dispatch, queriedOrder, runLocked]
  );

  const contentAlgorithm = (): React.ReactNode => {
    if (!isQuery) {
      return null;
    } else {
      if (isEmpty(result)) {
        return (
          <div className="row justify-content-md-center">
            <div className="col-md-6">
              <Alert variant="warning" showIcon={false}>
                <p className="h5 text-center mb-0">查無此單號資料</p>
              </Alert>
            </div>
          </div>
        );
      } else {
        return (
          <StockInfoContainer
            isLoading={isLoading}
            result={result}
            handleInStockRollback={handleInStockRollback}
          />
        );
      }
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleOrderQuerySubmit}>
        <div className="row mb-0">
          <label htmlFor="instock-rollback-orderType" className="col-md-auto col-form-label text-center">
            進貨方式:
          </label>
          <div className="col-md-auto">
            <select
              id="instock-rollback-orderType"
              className="form-select"
              name="orderType"
              value={orderType}
              disabled={isLoading}
              onChange={handleOrderChange}
            >
              {Object.keys(OrderType).map((type, index) => (
                <option key={index} value={OrderType[type as keyof typeof OrderType]}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <label htmlFor="instock-rollback-orderNo" className="col-md-auto col-form-label text-center">
            單號:
          </label>
          <div className="col-md-auto">
            <input
              id="instock-rollback-orderNo"
              className="form-control"
              type="text"
              name="orderNo"
              placeholder="請輸入單號"
              value={orderNo}
              disabled={isLoading || orderType === ""}
              onChange={handleOrderChange}
            />
          </div>
          <div className="col-md-auto">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || orderType === "" || orderNo === ""}
            >
              查詢
            </button>
          </div>
        </div>
      </form>
      <hr />
      <LoadingOverlay active={isLoading} spinner={<Spinner />}>
        <div style={{ height: "70vh" }}>{contentAlgorithm()}</div>
      </LoadingOverlay>
    </div>
  );
};

export default InStockRollback;
