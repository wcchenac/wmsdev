import React, { useState, useCallback, ChangeEvent, FormEvent, MouseEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { notifyRequestFailed } from "../../../../utilities/notifyRequestFailed";
import { useUpdateEffect } from "../../../../utilities/useUpdateEffect";
import { getStockInfoes } from "../../../../actions/StockActions";
import StockInfoContainer from "./Common/StockInfoContainer";
import QueryProductInformation from "../Utilities/QueryProductInformation";
import ShowProductInformation from "../Utilities/ShowProductInformation";
import QueryResponseWithNoStock from "../Utilities/QueryResponseWithNoStock";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../Others/Spinner";
import ShowProductQuantity from "../Utilities/ShowProductQuantity";
import ToolbarForNextPrev from "../Utilities/ToolbarForNextPrev";
import { StockIdentifierType } from "../../../../enums/Enums";
import { RootState, AppDispatch, StockInfo } from "../../../../types";

interface ProductInfo {
  productNo: string;
  picture: string;
  cName: string;
  spec: string;
  packDesc: string;
  addType: string;
  descrip: string;
  supp: string;
  suppName: string;
  userField1: string;
  prodDesc: string;
  cCost: string | number;
  cCCCODE: string;
  eNAME?: string;
  eSPEC?: string;
}

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

const QueryBoard_Detail: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const [productNo, setProductNo] = useState<string>("");
  // Product number of the last query; the input above may be edited afterwards.
  const [queriedProductNo, setQueriedProductNo] = useState<string>("");
  const [prevProduct, setPrevProduct] = useState<string>("");
  const [nextProduct, setNextProduct] = useState<string>("");
  const [productInfo, setProductInfo] = useState<ProductInfo>({} as ProductInfo);
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

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setProductNo(e.target.value);
  }, []);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsLoading(true);
      setQueriedProductNo(productNo);
      dispatch(getStockInfoes(productNo)).then((response: { status: number }) => {
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
      dispatch(getStockInfoes(select)).then((response: { status: number }) => {
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
          typeValidation={
            stockQuantity[0]?.type === StockIdentifierType.hardware
          }
          stockInfoes={stockInfoes}
        />
      </React.Fragment>
    );
  };

  return (
    <div className="query_stockInfo">
      <div className="container">
        <div className="row">
          <div className="col-md-auto">
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
          <div style={{ height: "80vh" }}>
            <div>
              <div className="row">
                <div className="col-md-auto me-auto">
                  <ShowProductInformation
                    isBasic={false}
                    isQuery={isQuery}
                    productNo={productNo}
                    productInfo={productInfo}
                  />
                </div>
                <div className="col-md-auto">
                  <ToolbarForNextPrev
                    handleFutureProductQuery={handleFutureProductQuery}
                    prevProduct={prevProduct}
                    nextProduct={nextProduct}
                  />
                </div>
              </div>
              <br />
              {renderContent()}
            </div>
          </div>
        </LoadingOverlay>
      </div>
    </div>
  );
};

export default QueryBoard_Detail;
