import React, { useState, useRef, useCallback, ChangeEvent, FormEvent, MouseEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Nav, TabContainer, TabContent, TabPane } from "react-bootstrap";
import QueryOrder from "./Common/QueryOrder";
import SelectionBoard from "./Common/SelectionBoard";
import EditBoard from "./Common/EditBoard";
import {
  getAssembleOrder,
  batchCreateStockInfoes,
} from "../../../../actions/StockActions";
import {
  checkWaitHandleStatusCompletion,
  checkWaitHandleProductStatus,
} from "../Utilities/ValidateQueryOrderResponse";
import { isEmpty } from "../../../../utilities/IsEmpty";
import { useUpdateEffect } from "../../../../utilities/useUpdateEffect";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../Others/Spinner";
import { RootState, AppDispatch } from "../../../../types";
import { DefectOption } from "../../../../enums/Enums";

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

interface StockInfoData {
  productNo: string;
  lotNo: string;
  type: string;
  quantity: string;
  unit: string;
  color: string;
  defect: DefectOption[] | string;
  record: string;
  remark: string;
  inStockType: string;
  orderNo: string;
  directShip: boolean;
  outStockReason: string;
  errors: {
    quantity: string;
  };
}

const AssembleStockBoard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryAssembleOrderResult = useSelector((state: RootState) => state.stockInfo);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderNo, setOrderNo] = useState<string>("");
  const [isOrderValid, setIsOrderValid] = useState<boolean | undefined>(undefined);
  const [key, setKey] = useState<number>(1);
  const [, setCurrentOrderStatus] = useState<CurrentOrderStatus>({});
  const [waitHandleStatus, setWaitHandleStatus] = useState<WaitHandleStatus>({});
  const [selectedProductNoList, setSelectedProductNoList] = useState<SelectedProductNo[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getInitialize = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    setIsLoading(false);
    setIsOrderValid(undefined);
    setKey(1);
    setCurrentOrderStatus({});
    setWaitHandleStatus({});
    setSelectedProductNoList([]);
  }, []);

  const initialSelectedList = useCallback(
    (currentOrderStatusParam: CurrentOrderStatus, waitHandleStatusParam: WaitHandleStatus) => {
      if (!isEmpty(currentOrderStatusParam as Record<string, unknown>)) {
        const selectedList: SelectedProductNo[] = [];

        Object.keys(currentOrderStatusParam)
          .sort()
          .forEach((element, index) => {
            selectedList.push({
              productNo: element.toString(),
              selected: checkWaitHandleProductStatus(
                waitHandleStatusParam[element.toString()]
              ),
              index: index,
              isSubmitted: false,
            });
          });

        setSelectedProductNoList(selectedList);
      }
    },
    []
  );

  const handleTabSelect = useCallback((newKey: number) => {
    setKey(newKey);
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
      dispatch(getAssembleOrder(orderNo)).then((response) => {
        if (response.status === 200) {
          setIsLoading(false);
        }
      });
    },
    [dispatch, orderNo]
  );

  const handleCheckBoxSelected = useCallback((e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { checked } = e.target;

    setSelectedProductNoList((prevList) => {
      const copyList = [...prevList];
      copyList[index] = {
        ...copyList[index],
        selected: checked,
      };
      return copyList;
    });
  }, []);

  const handleSelectionClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const value = (e.target as HTMLButtonElement).value === "true";

    setSelectedProductNoList((prevList) => {
      return prevList.map((object) => ({
        ...object,
        selected: value,
      }));
    });
  }, []);

  const handleInStockRequestSubmit = useCallback(
    (e: MouseEvent<HTMLButtonElement>, index: number, inStockRequests: StockInfoData[]) => {
      e.preventDefault();

      setIsLoading(true);
      dispatch(batchCreateStockInfoes(inStockRequests as unknown as Parameters<typeof batchCreateStockInfoes>[0])).then((res) => {
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
      });
    },
    [dispatch]
  );

  // Only react to an order that arrives while this page is mounted, not one another page
  // left in the shared stockInfo slice (componentDidUpdate in dev).
  useUpdateEffect(queryAssembleOrderResult.stockInfoes, (result) => {
    if (result) {
      const stockInfoes = result as {
        currentStatus?: CurrentOrderStatus;
        waitHandleStatus?: WaitHandleStatus;
      };
      const newCurrentOrderStatus = stockInfoes.currentStatus;
      const newWaitHandleStatus = stockInfoes.waitHandleStatus;

      if (newCurrentOrderStatus) {
        setCurrentOrderStatus(newCurrentOrderStatus);
      }
      if (newWaitHandleStatus) {
        setWaitHandleStatus(newWaitHandleStatus);
      }

      if (
        !newCurrentOrderStatus ||
        isEmpty(newCurrentOrderStatus as Record<string, unknown>) ||
        (newWaitHandleStatus && checkWaitHandleStatusCompletion(newWaitHandleStatus))
      ) {
        setIsOrderValid(false);
      } else if (newCurrentOrderStatus && newWaitHandleStatus) {
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
          onSelect={(k) => handleTabSelect(Number(k))}
        >
          {/* Responsive Step Navigation */}
          <Nav
            justify
            variant="pills"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--spacing-2)',
            }}
          >
            <Nav.Item style={{ flex: '1 1 auto', minWidth: '120px' }}>
              <Nav.Link
                eventKey={1}
                disabled={key !== 1}
                style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-3)',
                  borderRadius: 'var(--border-radius-md)',
                }}
              >
                <span className="d-none d-md-inline">Step 1 - 查詢組裝單內容</span>
                <span className="d-md-none">
                  <strong>1</strong> 查詢
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item style={{ flex: '1 1 auto', minWidth: '120px' }}>
              <Nav.Link
                eventKey={2}
                disabled={key !== 2}
                style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-3)',
                  borderRadius: 'var(--border-radius-md)',
                }}
              >
                <span className="d-none d-md-inline">Step 2 - 選擇入庫貨號</span>
                <span className="d-md-none">
                  <strong>2</strong> 選擇
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item style={{ flex: '1 1 auto', minWidth: '120px' }}>
              <Nav.Link
                eventKey={3}
                disabled={key !== 3}
                style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-3)',
                  borderRadius: 'var(--border-radius-md)',
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
                      type="組裝單"
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
                  type="組裝單"
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
                  type="assemble"
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

export default AssembleStockBoard;
