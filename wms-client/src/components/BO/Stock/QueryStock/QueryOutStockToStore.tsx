import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getOutStockToStoreOrder } from "../../../../actions/StockActions";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../Others/Spinner";
import QueryOrder from "../InStock/Common/QueryOrder";
import { RootState, AppDispatch } from "../../../../types";

interface ProductInfo {
  productNo?: string;
  cName?: string;
  cCCCODE?: string;
  spec?: string;
  packDesc?: string;
}

const QueryOutStockToStore: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const [orderNo, setOrderNo] = useState<string>("");
  const [orderInfoes, setOrderInfoes] = useState<ProductInfo[]>([]);
  const [isOrderValid, setIsOrderValid] = useState<boolean | undefined>(undefined);

  const orderInfo = useSelector((state: RootState) => state.stockInfo);
  const dispatch = useDispatch<AppDispatch>();

  const handleOrderNo = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setOrderNo(e.target.value);
  }, []);

  const handleQueryOrderSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsLoading(true);
      dispatch(getOutStockToStoreOrder(orderNo)).then((response: { status: number }) => {
        if (response.status === 200) {
          setIsLoading(false);
          setIsQuery(true);
        }
      });
    },
    [dispatch, orderNo]
  );

  useEffect(() => {
    if (orderInfo && orderInfo.stockInfoes) {
      setOrderInfoes(orderInfo.stockInfoes as ProductInfo[]);
    }
  }, [orderInfo]);

  useEffect(() => {
    if (orderInfoes.length > 0 || orderInfoes === undefined) {
      setIsOrderValid(orderInfoes.length > 0);
    }
  }, [orderInfoes]);

  return (
    <div className="query_outStockToStore">
      <div className="container">
        <div className="row">
          <QueryOrder
            type="出庫單"
            handleOrderNo={handleOrderNo}
            handleQueryOrderSubmit={handleQueryOrderSubmit}
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
                    {orderInfoes.map((productInfo, index) => {
                      return (
                        <React.Fragment key={index}>
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
};

export default QueryOutStockToStore;
