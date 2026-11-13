import React, { useState, useCallback, FormEvent, MouseEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { notifyRequestFailed } from "../../../../utilities/notifyRequestFailed";
import { useUpdateEffect } from "../../../../utilities/useUpdateEffect";
import { getStockInfoesBasic } from "../../../../actions/StockActions";
import StockInfoContainer from "./Common/StockInfoContainer";
import QueryProductInformation, { ProductNoChange } from "../Utilities/QueryProductInformation";
import ShowProductInformation, { ProductInfo } from "../Utilities/ShowProductInformation";
import QueryResponseWithNoStock from "../Utilities/QueryResponseWithNoStock";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../Others/Spinner";
import ShowProductQuantity from "../Utilities/ShowProductQuantity";
import ToolbarForNextPrev from "../Utilities/ToolbarForNextPrev";
import { StockIdentifierType } from "../../../../enums/Enums";
import { RootState, AppDispatch, StockInfo } from "../../../../types";


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

const QueryBoard: React.FC = () => {
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

    if (
      reduxStockInfoes &&
      reduxStockInfoes.information &&
      reduxStockInfoes.information.productNo !== null
    ) {
      setProductNo(reduxStockInfoes.information.productNo || "");
      setQueriedProductNo(reduxStockInfoes.information.productNo || "");
      setPrevProduct(reduxStockInfoes.prevProduct || "");
      setNextProduct(reduxStockInfoes.nextProduct || "");
      setProductInfo(reduxStockInfoes.information);
      setStockInfoes(reduxStockInfoes.result || []);
      setStockQuantity(reduxStockInfoes.productList || []);
    }
  });

  const onChange = useCallback((e: ProductNoChange) => {
    const { name, value } = e.target;
    if (name === "productNo") {
      setProductNo(value);
    }
  }, []);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      setQueriedProductNo(productNo);

      dispatch(getStockInfoesBasic(productNo)).then((response: { status: number }) => {
        if (response.status === 200) {
          setIsLoading(false);
          setIsQuery(true);
        }
      }).catch((error) => {
        setIsLoading(false);
        notifyRequestFailed(error);
      });
    },
    [dispatch, productNo]
  );

  const handleFutureProductQuery = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const select = (e.target as HTMLButtonElement).value;

      setIsLoading(true);
      setQueriedProductNo(select);

      dispatch(getStockInfoesBasic(select)).then((response: { status: number }) => {
        if (response.status === 200) {
          setIsLoading(false);
          setIsQuery(true);
        }
      }).catch((error) => {
        setIsLoading(false);
        notifyRequestFailed(error);
      });
    },
    [dispatch]
  );

  const contentAlgorithm = useCallback((): React.ReactNode => {
    if (!isQuery) {
      return null;
    } else {
      if (stockInfoes.length === 0) {
        return <QueryResponseWithNoStock productNo={queriedProductNo} onRetry={undefined} />;
      } else {
        return (
          <React.Fragment>
            <ShowProductQuantity stockQuantity={stockQuantity} />
            <br />
            <StockInfoContainer
              typeValidation={
                stockQuantity[0]?.type === StockIdentifierType.hardware
              }
              stockInfoes={stockInfoes}
            />
          </React.Fragment>
        );
      }
    }
  }, [isQuery, stockInfoes, stockQuantity, queriedProductNo]);

  return (
    <div className="query_stockInfo">
      <div className="container">
        {/* Query Input Section - RWD */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--spacing-3)',
            marginBottom: 'var(--spacing-3)',
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: '280px' }}>
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
              {/* Product Info & Navigation - RWD */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 'var(--spacing-3)',
                  marginBottom: 'var(--spacing-3)',
                }}
              >
                <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
                  <ShowProductInformation
                    isBasic={true}
                    isQuery={isQuery}
                    productNo={productNo}
                    productInfo={productInfo}
                  />
                </div>
                <div style={{ flex: '0 0 auto' }}>
                  <ToolbarForNextPrev
                    handleFutureProductQuery={handleFutureProductQuery}
                    prevProduct={prevProduct}
                    nextProduct={nextProduct}
                  />
                </div>
              </div>
              {contentAlgorithm()}
            </div>
          </div>
        </LoadingOverlay>
      </div>
    </div>
  );
};

export default QueryBoard;
