import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getInStockRollbackList,
  inStockRollback
} from "../../../../../actions/StockActions";
import { OrderType } from "../../../../../enums/Enums";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../../Others/Spinner";
import { isEmpty } from "../../../../../utilities/IsEmpty";
import StockInfoContainer from "./StockInfoContainer";
import { RootState, InStockRollbackResult, AppDispatch } from "../../../../../types";

const InStockRollback: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const [orderNo, setOrderNo] = useState<string>("");
  const [orderType, setOrderType] = useState<string>("");
  const [result, setResult] = useState<InStockRollbackResult>({});

  const dispatch = useDispatch<AppDispatch>();
  const queryResult = useSelector((state: RootState) => state.stockInfo);

  useEffect(() => {
    if (queryResult.stockInfoes) {
      setResult(queryResult.stockInfoes as InStockRollbackResult);
    }
  }, [queryResult.stockInfoes]);

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
      setIsLoading(true);

      dispatch(getInStockRollbackList(orderType, orderNo)).then((response: { status: number }) => {
        if (response.status === 200) {
          setIsLoading(false);
          setIsQuery(true);
        }
      });
    },
    [dispatch, orderType, orderNo]
  );

  const handleInStockRollback = useCallback(
    (idList: number[]) => {
      setIsLoading(true);

      dispatch(inStockRollback(idList, orderType, orderNo)).then((response: { status: number }) => {
        if (response.status === 200) {
          setIsLoading(false);
        }
      });
    },
    [dispatch, orderType, orderNo]
  );

  const contentAlgorithm = (): React.ReactNode => {
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
            handleInStockRollback={handleInStockRollback}
          />
        );
      }
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleOrderQuerySubmit}>
        <div className="form-group row mb-0">
          <label className="col-md-auto col-form-label text-center">
            進貨方式:
          </label>
          <div className="col-md-auto">
            <select
              className="custom-select"
              name="orderType"
              defaultValue=""
              onChange={handleOrderChange}
            >
              {Object.keys(OrderType).map((type, index) => (
                <option key={index} value={OrderType[type as keyof typeof OrderType]}>
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
              disabled={orderType === ""}
              onChange={handleOrderChange}
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
        <div style={{ height: "70vh" }}>{contentAlgorithm()}</div>
      </LoadingOverlay>
    </div>
  );
};

export default InStockRollback;
