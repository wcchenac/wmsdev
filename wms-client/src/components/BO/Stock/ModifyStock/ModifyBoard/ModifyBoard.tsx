import React, { useState, useCallback, useMemo, FormEvent, MouseEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { notifyRequestFailed } from "../../../../../utilities/notifyRequestFailed";
import { useUpdateEffect } from "../../../../../utilities/useUpdateEffect";
import {
  getStockInfoes,
  stockIdentifierIsShiped,
  stockIdentifiersAreShiped,
  stockIdentifierWaitToShrinkIsTrue,
  createOutStockRequest,
  updateStockInfo
} from "../../../../../actions/StockActions";
import StockInfoContainer from "./StockInfoContainer";
import QueryProductInformation from "../../Utilities/QueryProductInformation";
import ShowProductInformation from "../../Utilities/ShowProductInformation";
import OutStockModal from "./OutStockModal";
import QueryResponseWithNoStock from "../../Utilities/QueryResponseWithNoStock";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../../Others/Spinner";
import ShowProductQuantity from "../../Utilities/ShowProductQuantity";
import { Button } from "react-bootstrap";
import BatchShipModal from "./BatchShipModal";
import ToolbarForNextPrev from "../../Utilities/ToolbarForNextPrev";
import { StockIdentifierType } from "../../../../../enums/Enums";
import {
  RootState,
  AppDispatch,
  StockInfo as StockInfoType,
  StockIdentifier,
  ShipRequest,
  StockInfoesWithResult
} from "../../../../../types";

// ============================================
// Type Definitions
// ============================================
interface ProductInfo {
  productNo?: string;
  picture?: string;
  cName?: string;
  spec?: string;
  packDesc?: string;
  addType?: string;
  descrip?: string;
  supp?: string;
  suppName?: string;
  userField1?: string;
  prodDesc?: string;
  cCost?: string | number;
  cCCCODE?: string;
  [key: string]: unknown;
}

interface StockQuantityItem {
  type: string;
  quantity: number | string;
  unit: string;
}

interface OutStockRequestSubmit {
  productNo: string;
  type: string;
  quantity: string;
  unit: string;
  reason: string;
}

interface UpdateInfoRequest {
  id?: number;
  color?: string;
  defect?: string;
  record?: string;
  remark?: string;
}

interface ShipListItem {
  stockIdentifierId: number;
  reason: string;
}

interface StockInfoesResponse extends StockInfoesWithResult {
  information?: ProductInfo;
  prevProduct?: string;
  nextProduct?: string;
  productList?: StockQuantityItem[];
}

// ============================================
// Component
// ============================================
const ModifyBoard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryResult = useSelector((state: RootState) => state.stockInfo);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const [modalShow_BatchShip, setModalShow_BatchShip] = useState<boolean>(false);
  const [modalShow_OutStock, setModalShow_OutStock] = useState<boolean>(false);
  const [productNo, setProductNo] = useState<string>("");
  const [prevProduct, setPrevProduct] = useState<string>("");
  const [nextProduct, setNextProduct] = useState<string>("");
  const [productInfo, setProductInfo] = useState<ProductInfo>({});
  const [stockInfoes, setStockInfoes] = useState<StockInfoType[]>([]);
  const [stockQuantity, setStockQuantity] = useState<StockQuantityItem[]>([]);

  // Only react to a result that arrives while this page is mounted, not one another page
  // left in the shared stockInfo slice (componentDidUpdate in dev).
  useUpdateEffect(queryResult.stockInfoes, (result) => {
    const stockInfoesData = result as StockInfoesResponse | undefined;
    if (
      stockInfoesData?.information?.productNo !== null &&
      stockInfoesData?.information?.productNo !== undefined
    ) {
      setProductNo(stockInfoesData.information.productNo);
      setPrevProduct(stockInfoesData.prevProduct || "");
      setNextProduct(stockInfoesData.nextProduct || "");
      setProductInfo(stockInfoesData.information);
      setStockInfoes(stockInfoesData.result || []);
      setStockQuantity(stockInfoesData.productList || []);
    }
  });

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProductNo(e.target.value);
  }, []);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      (dispatch(getStockInfoes(productNo)) as Promise<{ status: number }>).then((response) => {
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
      (dispatch(getStockInfoes(select)) as Promise<{ status: number }>).then((response) => {
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

  const handleOutStockRequestSubmit = useCallback(
    (outStockRequest: OutStockRequestSubmit) => {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dispatch(createOutStockRequest(outStockRequest as any)) as Promise<{ status: number }>).then((response) => {
        if (response.status === 200) {
          setIsLoading(false);
          setModalShow_OutStock(false);
        }
      }).catch((error) => {
        setIsLoading(false);
        notifyRequestFailed(error);
      });
    },
    [dispatch]
  );

  const handleShip = useCallback(
    (shipRequest: ShipRequest) => {
      setIsLoading(true);
      (dispatch(stockIdentifierIsShiped(shipRequest)) as Promise<{ status: number }>).then((response) => {
        if (response.status === 200) {
          setIsLoading(false);
          setModalShow_BatchShip(false);
        }
      }).catch((error) => {
        setIsLoading(false);
        notifyRequestFailed(error);
      });
    },
    [dispatch]
  );

  const handleShipList = useCallback(
    (shipRequests: ShipListItem[]) => {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dispatch(stockIdentifiersAreShiped(productNo, shipRequests as any)) as Promise<{ status: number }>).then(
        () => {
          setIsLoading(false);
          setModalShow_BatchShip(false);
        }
      ).catch((error) => {
        setIsLoading(false);
        notifyRequestFailed(error);
      });
    },
    [dispatch, productNo]
  );

  const handleShrink = useCallback(
    (id: number) => {
      setIsLoading(true);
      (dispatch(stockIdentifierWaitToShrinkIsTrue(id)) as Promise<{ status: number }>).then((response) => {
        if (response.status === 200) {
          setIsLoading(false);
        }
      }).catch((error) => {
        setIsLoading(false);
        notifyRequestFailed(error);
      });
    },
    [dispatch]
  );

  const handleStockInfoUpdate = useCallback(
    (updateInfoRequest: UpdateInfoRequest) => {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dispatch(updateStockInfo(updateInfoRequest as any)) as Promise<{ status: number }>).then((response) => {
        if (response.status === 200) {
          setIsLoading(false);
        }
      }).catch((error) => {
        setIsLoading(false);
        notifyRequestFailed(error);
      });
    },
    [dispatch]
  );

  const handleModalClose_BatchShip = useCallback(() => {
    setModalShow_BatchShip(false);
  }, []);

  const handleModalShow_BatchShip = useCallback(() => {
    setModalShow_BatchShip(true);
  }, []);

  const handleModalClose_OutStock = useCallback(() => {
    setModalShow_OutStock(false);
  }, []);

  const handleModalShow_OutStock = useCallback(() => {
    setModalShow_OutStock(true);
  }, []);

  const infoSimplify = useCallback((): StockIdentifier[] => {
    const identifiers: StockIdentifier[] = [];
    stockInfoes.forEach((info) => {
      if (info.stockIdentifier) {
        identifiers.push(info.stockIdentifier);
      }
    });
    return identifiers;
  }, [stockInfoes]);

  const outStockRequestValidate = useMemo(() => {
    return (
      !isQuery ||
      productNo.toUpperCase() !== productInfo.productNo ||
      stockInfoes.length === 0 ||
      stockInfoes[0]?.stockIdentifier?.type === StockIdentifierType.hardware
    );
  }, [isQuery, productNo, productInfo.productNo, stockInfoes]);

  const typeValidation = useMemo(() => {
    return (
      stockInfoes.length > 0 &&
      stockInfoes[0]?.stockIdentifier?.type === StockIdentifierType.hardware
    );
  }, [stockInfoes]);

  const renderContent = (): React.ReactElement | null => {
    if (!isQuery) {
      return null;
    }

    if (stockInfoes.length === 0) {
      return <QueryResponseWithNoStock />;
    }

    return (
      <React.Fragment>
        <ShowProductQuantity stockQuantity={stockQuantity} />
        <br />
        <div className="row">
          <div className="col-md-auto me-auto" />
          <div className="col-md-auto">
            <Button
              variant="info"
              size="sm"
              onClick={handleModalShow_BatchShip}
            >
              {"\u6279\u91cf\u51fa\u5eab"}
            </Button>
          </div>
          {modalShow_BatchShip ? (
            <BatchShipModal
              show
              handleModalClose={handleModalClose_BatchShip}
              handleShipList={handleShipList}
              typeValidation={typeValidation}
              data={infoSimplify() as Parameters<typeof BatchShipModal>[0]['data']}
            />
          ) : null}
        </div>
        <StockInfoContainer
          typeValidation={typeValidation}
          stockInfoes={stockInfoes}
          handleShip={handleShip}
          handleShrink={handleShrink}
          handleStockInfoUpdate={handleStockInfoUpdate}
        />
      </React.Fragment>
    );
  };

  return (
    <div className="modify_stockInfo">
      <div className="container">
        <div className="row">
          <div className="col-md-auto">
            <QueryProductInformation
              productNo={productNo}
              onSubmit={onSubmit}
              onChange={onChange}
            />
          </div>
        </div>
        <hr />
        <LoadingOverlay active={isLoading} spinner={<Spinner />}>
          <div style={{ height: "80vh" }}>
            <div>
              <div className="row">
                <div className="col-md-auto me-2">
                  <ShowProductInformation
                    isBasic={false}
                    isQuery={isQuery}
                    productNo={productNo}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    productInfo={productInfo as any}
                  />
                </div>
                <div className="col-md-auto me-auto">
                  <Button
                    variant="primary"
                    disabled={outStockRequestValidate}
                    onClick={handleModalShow_OutStock}
                  >
                    {"\u62c9\u8ca8\u8981\u6c42"}
                  </Button>
                  {modalShow_OutStock ? (
                    <OutStockModal
                      show
                      handleModalClose={handleModalClose_OutStock}
                      productNo={productNo.toUpperCase()}
                      handleOutStockRequestSubmit={handleOutStockRequestSubmit}
                    />
                  ) : null}
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

export default ModifyBoard;
