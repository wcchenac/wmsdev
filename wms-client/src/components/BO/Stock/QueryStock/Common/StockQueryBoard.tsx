import React, { useState, useCallback, FormEvent, MouseEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AxiosResponse } from "axios";
import { notifyRequestFailed } from "../../../../../utilities/notifyRequestFailed";
import { useUpdateEffect } from "../../../../../utilities/useUpdateEffect";
import StockInfoContainer from "./StockInfoContainer";
import QueryProductInformation, { ProductNoChange } from "../../Utilities/QueryProductInformation";
import ShowProductInformation, { ProductInfo } from "../../Utilities/ShowProductInformation";
import QueryResponseWithNoStock from "../../Utilities/QueryResponseWithNoStock";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { Spinner } from "../../../../Others/Spinner";
import ShowProductQuantity from "../../Utilities/ShowProductQuantity";
import ToolbarForNextPrev from "../../Utilities/ToolbarForNextPrev";
import { StockIdentifierType } from "../../../../../enums/Enums";
import { RootState, AppDispatch, StockInfo } from "../../../../../types";

interface StockQuantityItem {
  type: string;
  quantity: number | string;
  unit: string;
}

interface StockInfoesResponse {
  information?: ProductInfo;
  prevProduct?: string;
  nextProduct?: string;
  result?: StockInfo[];
  productList?: StockQuantityItem[];
}

export interface StockQueryBoardProps {
  isBasic: boolean;
  fetchStockInfo: (productNo: string) => (dispatch: AppDispatch) => Promise<AxiosResponse>;
}

/**
 * Shared stock query view used by both basic (/stock/2/1) and detailed (/stock/2/2) boards.
 */
const StockQueryBoard: React.FC<StockQueryBoardProps> = ({ isBasic, fetchStockInfo }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const [productNo, setProductNo] = useState<string>("");
  // Product number of the last query; the input above may be edited afterwards.
  const [queriedProductNo, setQueriedProductNo] = useState<string>("");
  const [prevProduct, setPrevProduct] = useState<string>("");
  const [nextProduct, setNextProduct] = useState<string>("");
  const [productInfo, setProductInfo] = useState<ProductInfo>({});
  const [stockInfoes, setStockInfoes] = useState<StockInfo[]>([]);
  const [stockQuantity, setStockQuantity] = useState<StockQuantityItem[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const stockInfo = useSelector((state: RootState) => state.stockInfo);

  // Only react to a result that arrives while this page is mounted, not one another page
  // left in the shared stockInfo slice (componentDidUpdate in dev).
  useUpdateEffect(stockInfo.stockInfoes, (result) => {
    const reduxStockInfoes = result as StockInfoesResponse | undefined;
    const infoProductNo = reduxStockInfoes?.information?.productNo;

    if (
      reduxStockInfoes?.information &&
      infoProductNo !== null &&
      infoProductNo !== undefined
    ) {
      setProductNo(infoProductNo);
      setQueriedProductNo(infoProductNo);
      setPrevProduct(reduxStockInfoes.prevProduct || "");
      setNextProduct(reduxStockInfoes.nextProduct || "");
      setProductInfo(reduxStockInfoes.information);
      setStockInfoes(reduxStockInfoes.result || []);
      setStockQuantity(reduxStockInfoes.productList || []);
    } else {
      setPrevProduct("");
      setNextProduct("");
      setProductInfo({});
      setStockInfoes([]);
      setStockQuantity([]);
    }
  });

  const onChange = useCallback((e: ProductNoChange) => {
    if (e.target.name === "productNo") {
      setProductNo(e.target.value);
    }
  }, []);

  const runQuery = useCallback(
    (targetProductNo: string) => {
      setIsLoading(true);
      setQueriedProductNo(targetProductNo);

      dispatch(fetchStockInfo(targetProductNo))
        .then((response: { status: number }) => {
          if (response.status === 200) {
            setIsQuery(true);
          }
        })
        .catch((error) => {
          notifyRequestFailed(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [dispatch, fetchStockInfo]
  );

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      runQuery(productNo);
    },
    [productNo, runQuery]
  );

  const handleFutureProductQuery = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const select = e.currentTarget.value;
      setProductNo(select);
      runQuery(select);
    },
    [runQuery]
  );

  const renderContent = (): React.ReactNode => {
    if (!isQuery) {
      return null;
    }
    if (stockInfoes.length === 0) {
      return <QueryResponseWithNoStock productNo={queriedProductNo} onRetry={undefined} />;
    }
    return (
      <React.Fragment>
        <ShowProductQuantity stockQuantity={stockQuantity} />
        <br />
        <StockInfoContainer
          typeValidation={stockQuantity[0]?.type === StockIdentifierType.hardware}
          stockInfoes={stockInfoes}
        />
      </React.Fragment>
    );
  };

  return (
    <div className="query_stockInfo">
      <div className="container">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--spacing-3)",
            marginBottom: "var(--spacing-3)",
          }}
        >
          <div style={{ flex: "1 1 auto", minWidth: "280px" }}>
            <QueryProductInformation
              productNo={productNo}
              onSubmit={onSubmit}
              onChange={onChange}
              isLoading={isLoading}
            />
          </div>
        </div>
        <hr />
        <LoadingOverlay active={isLoading} spinner={<Spinner />}>
          <div style={{ minHeight: "80vh" }}>
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "var(--spacing-3)",
                  marginBottom: "var(--spacing-3)",
                }}
              >
                <div style={{ flex: "1 1 auto", minWidth: "200px" }}>
                  <ShowProductInformation
                    isBasic={isBasic}
                    isQuery={isQuery}
                    productNo={productNo}
                    productInfo={productInfo}
                  />
                </div>
                <div style={{ flex: "0 0 auto" }}>
                  <ToolbarForNextPrev
                    handleFutureProductQuery={handleFutureProductQuery}
                    prevProduct={prevProduct}
                    nextProduct={nextProduct}
                    isLoading={isLoading}
                  />
                </div>
              </div>
              {renderContent()}
            </div>
          </div>
        </LoadingOverlay>
      </div>
    </div>
  );
};

export default StockQueryBoard;
