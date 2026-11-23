import React, { useState, useCallback, ChangeEvent, FormEvent, MouseEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AxiosResponse } from "axios";
import { notifyRequestFailed } from "../../../../../utilities/notifyRequestFailed";
import { Nav, TabContainer, TabContent, TabPane } from "react-bootstrap";
import QueryOrder from "./QueryOrder";
import SelectionBoard from "./SelectionBoard";
import EditBoard from "./EditBoard";
import { batchCreateStockInfoes } from "../../../../../actions/StockActions";
import {
  checkWaitHandleStatusCompletion,
  checkWaitHandleProductStatus,
  applyProductSelection,
} from "../../Utilities/ValidateQueryOrderResponse";
import { isEmpty } from "../../../../../utilities/IsEmpty";
import { useUpdateEffect } from "../../../../../utilities/useUpdateEffect";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { Spinner } from "../../../../Others/Spinner";
import { RootState, AppDispatch, InStockRequest } from "../../../../../types";

interface WaitHandleStatusItem {
  quantity: string | number;
  unit: string;
}

interface WaitHandleStatus {
  [productNo: string]: {
    [type: string]: WaitHandleStatusItem;
  };
}

interface CurrentOrderStatus {
  [productNo: string]: unknown;
}

interface SelectedProductNo {
  productNo: string;
  selected: boolean;
  index: number;
  isSubmitted: boolean;
}

interface StockInfoesResponse {
  currentStatus?: CurrentOrderStatus | null;
  waitHandleStatus?: WaitHandleStatus | null;
}

export interface InStockBoardProps {
  orderLabel: "進貨單" | "組裝單" | "退貨單" | "調撥單";
  inStockType: "normal" | "assemble" | "customerReturn" | "storeReturn";
  fetchOrder: (orderNo: string) => (dispatch: AppDispatch) => Promise<AxiosResponse>;
}

/**
 * Shared 3-step in-stock wizard used by NormalStockBoard, AssembleStockBoard,
 * CustomerReturnBoard, and StoreReturnBoard.
 */
const InStockBoard: React.FC<InStockBoardProps> = ({
  orderLabel,
  inStockType,
  fetchOrder,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryOrderResult = useSelector((state: RootState) => state.stockInfo);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderNo, setOrderNo] = useState<string>("");
  const [isOrderValid, setIsOrderValid] = useState<boolean | undefined>(undefined);
  const [key, setKey] = useState<number>(1);
  const [waitHandleStatus, setWaitHandleStatus] = useState<WaitHandleStatus>({});
  const [selectedProductNoList, setSelectedProductNoList] = useState<SelectedProductNo[]>([]);

  const initialSelectedList = useCallback(
    (currentStatus: CurrentOrderStatus, waitHandle: WaitHandleStatus) => {
      if (!isEmpty(currentStatus as Record<string, unknown>)) {
        const selectedList = Object.keys(currentStatus)
          .sort()
          .map((element, index) => ({
            productNo: element.toString(),
            selected: checkWaitHandleProductStatus(waitHandle[element.toString()]),
            index,
            isSubmitted: false,
          }));

        setSelectedProductNoList(selectedList);
      }
    },
    []
  );

  const getInitialize = useCallback(() => {
    setIsLoading(false);
    setIsOrderValid(undefined);
    setKey(1);
    setWaitHandleStatus({});
    setSelectedProductNoList([]);
  }, []);

  const handlePrevStep = useCallback(() => {
    setKey((prevKey) => prevKey - 1);
  }, []);

  const handleNextStep = useCallback(() => {
    setKey((prevKey) => prevKey + 1);
  }, []);

  const handleOrderNo = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setOrderNo(e.target.value);
  }, []);

  const handleQueryOrderSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsLoading(true);
      dispatch(fetchOrder(orderNo))
        .then((response) => {
          if (response.status === 200) {
            setIsLoading(false);
          }
        })
        .catch((error) => {
          setIsLoading(false);
          notifyRequestFailed(error);
        });
    },
    [dispatch, fetchOrder, orderNo]
  );

  const handleCheckBoxSelected = useCallback(
    (e: ChangeEvent<HTMLInputElement>, index: number) => {
      const { checked } = e.target;

      setSelectedProductNoList((prevList) => {
        const copyList = [...prevList];
        copyList[index] = {
          ...copyList[index],
          selected: checked,
        };
        return copyList;
      });
    },
    []
  );

  const handleSelectionClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const value = e.currentTarget.value === "true";

      setSelectedProductNoList((prevList) =>
        applyProductSelection(prevList, waitHandleStatus, value)
      );
    },
    [waitHandleStatus]
  );

  const handleInStockRequestSubmit = useCallback(
    (e: MouseEvent<HTMLButtonElement>, index: number, inStockRequests: InStockRequest[]) => {
      e.preventDefault();

      setIsLoading(true);
      dispatch(batchCreateStockInfoes(inStockRequests))
        .then((res) => {
          if (res.status === 200) {
            setSelectedProductNoList((prevList) => {
              const copyList = [...prevList];
              copyList[index] = {
                ...copyList[index],
                isSubmitted: true,
              };
              return copyList;
            });
          }
          // Only the submitted product is marked; the order is not re-queried, since that would
          // rebuild the Step 2 list and bring back products the user left unticked.
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          notifyRequestFailed(error);
        });
    },
    [dispatch]
  );

  // Only react to an order that arrives while this page is mounted, not one another page
  // left in the shared stockInfo slice (componentDidUpdate in dev).
  useUpdateEffect(queryOrderResult.orderResult, (result) => {
    if (result) {
      const stockInfoes = result as StockInfoesResponse;
      const newCurrentOrderStatus = stockInfoes.currentStatus;
      const newWaitHandleStatus = stockInfoes.waitHandleStatus;

      if (newWaitHandleStatus) {
        setWaitHandleStatus(newWaitHandleStatus);
      }

      if (
        !newCurrentOrderStatus ||
        !newWaitHandleStatus ||
        isEmpty(newCurrentOrderStatus as Record<string, unknown>) ||
        checkWaitHandleStatusCompletion(newWaitHandleStatus)
      ) {
        setIsOrderValid(false);
      } else {
        initialSelectedList(newCurrentOrderStatus, newWaitHandleStatus);
        setIsOrderValid(true);
        // Only auto-jump to step 2 if we are coming from step 1
        setKey((prevKey) => (prevKey === 1 ? 2 : prevKey));
      }
    }
  });

  return (
    <div className="batch_add_stockInfo">
      <div className="container">
        <TabContainer
          id="left-tabs"
          activeKey={key}
          onSelect={(k) => {
            if (k !== null) {
              setKey(Number(k));
            }
          }}
        >
          {/* Responsive Step Navigation */}
          <Nav
            justify
            variant="pills"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--spacing-2)",
            }}
          >
            <Nav.Item style={{ flex: "1 1 auto", minWidth: "120px" }}>
              <Nav.Link
                eventKey={1}
                disabled={key !== 1}
                style={{
                  textAlign: "center",
                  padding: "var(--spacing-3)",
                  borderRadius: "var(--border-radius-md)",
                }}
              >
                <span className="d-none d-md-inline">{`Step 1 - 查詢${orderLabel}內容`}</span>
                <span className="d-md-none">
                  <strong>1</strong> 查詢
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item style={{ flex: "1 1 auto", minWidth: "120px" }}>
              <Nav.Link
                eventKey={2}
                disabled={key !== 2}
                style={{
                  textAlign: "center",
                  padding: "var(--spacing-3)",
                  borderRadius: "var(--border-radius-md)",
                }}
              >
                <span className="d-none d-md-inline">Step 2 - 選擇入庫貨號</span>
                <span className="d-md-none">
                  <strong>2</strong> 選擇
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item style={{ flex: "1 1 auto", minWidth: "120px" }}>
              <Nav.Link
                eventKey={3}
                disabled={key !== 3}
                style={{
                  textAlign: "center",
                  padding: "var(--spacing-3)",
                  borderRadius: "var(--border-radius-md)",
                }}
              >
                <span className="d-none d-md-inline">Step 3 - 輸入詳細資料及送出</span>
                <span className="d-md-none">
                  <strong>3</strong> 送出
                </span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <hr />
          <TabContent>
            <TabPane eventKey={1}>
              <div className="container-fluid px-0 px-md-3">
                <LoadingOverlay
                  active={isLoading && key === 1}
                  spinner={<Spinner />}
                >
                  <div style={{ minHeight: "80vh" }}>
                    <QueryOrder
                      type={orderLabel}
                      orderNo={orderNo}
                      handleOrderNo={handleOrderNo}
                      handleQueryOrderSubmit={handleQueryOrderSubmit}
                      isOrderValid={isOrderValid}
                    />
                  </div>
                </LoadingOverlay>
              </div>
            </TabPane>
            <TabPane eventKey={2}>
              <div className="container-fluid px-0 px-md-3">
                <SelectionBoard
                  handlePrevStep={getInitialize}
                  handleNextStep={handleNextStep}
                  type={orderLabel}
                  orderNo={orderNo}
                  waitHandleStatus={waitHandleStatus}
                  selectedProductNoList={selectedProductNoList}
                  handleCheckBoxSelected={handleCheckBoxSelected}
                  handleSelectionClick={handleSelectionClick}
                />
              </div>
            </TabPane>
            <TabPane eventKey={3}>
              <div className="container-fluid px-0 px-md-3">
                <EditBoard
                  isLoading={isLoading && key === 3}
                  type={inStockType}
                  handlePrevStep={handlePrevStep}
                  orderNo={orderNo}
                  selectedProductNoList={selectedProductNoList}
                  waitHandleStatus={waitHandleStatus}
                  handleInStockRequestSubmit={handleInStockRequestSubmit}
                  getInitialize={getInitialize}
                />
              </div>
            </TabPane>
          </TabContent>
        </TabContainer>
      </div>
    </div>
  );
};

export default InStockBoard;
