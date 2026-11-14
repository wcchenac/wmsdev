import React, { useState, useCallback, ChangeEvent, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { notifyRequestFailed } from "../../../../utilities/notifyRequestFailed";
import { useUpdateEffect } from "../../../../utilities/useUpdateEffect";
import { getOutStockToStoreOrder } from "../../../../actions/StockActions";
import LoadingOverlay from "@achmadk/react-loading-overlay";
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
      }).catch((error) => {
        setIsLoading(false);
        notifyRequestFailed(error);
      });
    },
    [dispatch, orderNo]
  );

  // Only react to a result that arrives while this page is mounted, not one another page
  // left in the shared stockInfo slice (componentDidUpdate in dev).
  // The backend answers an unknown order number with an empty list, so every new result
  // decides whether the order was found.
  useUpdateEffect(orderInfo.stockInfoes, (result) => {
    const rows = Array.isArray(result) ? (result as ProductInfo[]) : [];
    setOrderInfoes(rows);
    setIsOrderValid(rows.length > 0);
  });

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
                  <thead className="table-dark">
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
