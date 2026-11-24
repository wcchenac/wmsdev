import React, { useState, useCallback, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getShrinkRollbackList,
  shrinkRollback
} from "../../../../../actions/StockActions";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { Spinner } from "../../../../Others/Spinner";
import QueryProductInformation, { ProductNoChange } from "../../../Stock/Utilities/QueryProductInformation";
import StockInfoContainer from "./StockInfoContainer";
import { Alert } from "../../../../UI";
import { RootState, AppDispatch, ShrinkRollbackObject } from "../../../../../types";
import { notifyRequestFailed } from "../../../../../utilities/notifyRequestFailed";
import { notifyRollbackFailed, RollbackError } from "../../../../../utilities/rollbackRequest";
import { useSubmitLock } from "../../../../../utilities/useSubmitLock";

const ShrinkRollback: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const rawList = useSelector((state: RootState) => state.stockInfo.shrinkRollbackList);
  const result = Array.isArray(rawList) ? (rawList as ShrinkRollbackObject[]) : [];

  const { isLocked: isLoading, runLocked } = useSubmitLock();
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const [productNo, setProductNo] = useState<string>("");
  /**
   * The product the list on screen belongs to. A rollback and its refresh use this, not the
   * search box, which the admin may have changed since.
   */
  const [queriedProductNo, setQueriedProductNo] = useState<string>("");

  const handleProductNoChange = useCallback((e: ProductNoChange): void => {
    if (e.target.name === "productNo") {
      setProductNo(e.target.value);
    }
  }, []);

  const handleQuerySubmit = useCallback((e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void runLocked(() =>
      dispatch(getShrinkRollbackList(productNo))
        .then((response: { status: number }) => {
          if (response.status === 200) {
            setIsQuery(true);
            setQueriedProductNo(productNo);
          }
        })
        .catch((error: unknown) => {
          notifyRequestFailed(error);
        })
    );
  }, [dispatch, productNo, runLocked]);

  const handleShrinkRollback = useCallback((stockIdentifierId: number): Promise<boolean> =>
    runLocked(() =>
      // The action queries the list again whatever the outcome; a failure says what happened.
      dispatch(shrinkRollback(stockIdentifierId, queriedProductNo))
        .then(() => true)
        .catch((error) => {
          notifyRollbackFailed(error);
          return error instanceof RollbackError && error.rolledBack;
        })
    ).then((res) => Boolean(res)), [dispatch, queriedProductNo, runLocked]);

  const renderContent = (): React.ReactNode => {
    if (!isQuery) {
      return null;
    }
    if (result.length === 0) {
      return (
        <div className="row justify-content-md-center">
          <div className="col-md-6">
            <Alert variant="warning" showIcon={false}>
              <p className="h5 text-center mb-0">查無此貨號資料</p>
            </Alert>
          </div>
        </div>
      );
    }
    return (
      <StockInfoContainer
        isLoading={isLoading}
        result={result}
        handleShrinkRollback={handleShrinkRollback}
      />
    );
  };

  return (
    <div className="container">
      <div className="row mb-0">
        <div className="col-auto">
          <QueryProductInformation
            productNo={productNo}
            onSubmit={handleQuerySubmit}
            onChange={handleProductNoChange}
            isLoading={isLoading}
          />
        </div>
        <div className="col-md-auto">
          <span className="form-text text-muted d-inline-block py-2">
            預設查詢最近五筆
          </span>
        </div>
      </div>
      <hr />
      <LoadingOverlay active={isLoading} spinner={<Spinner />}>
        <div style={{ height: "70vh" }}>{renderContent()}</div>
      </LoadingOverlay>
    </div>
  );
};

export default ShrinkRollback;
