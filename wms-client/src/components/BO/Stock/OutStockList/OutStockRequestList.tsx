import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { notifyRequestFailed } from "../../../../utilities/notifyRequestFailed";
import UserSelection from "./UserSelection";
import SearchBoard from "./SearchBoard";
import {
  getWaitHandleList,
  getWaitHandleListWithInterval,
  updateOutStockRequests,
  stockIdentifierIsNotShiped,
  deleteOutStockRequest
} from "../../../../actions/StockActions";
import { downloadFile } from "../../../../actions/FileActions";
import "react-datepicker/dist/react-datepicker.css";
import { copy } from "../../../../utilities/DeepCopy";
import DatePeriodSelectModal from "../Utilities/DatePeriodSelectModal";
import { dayOfStart, dayOfEnd } from "../Utilities/DateUtils";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../Others/Spinner";
import ConfirmModal from "./ConfirmModal";
import { RootState, AppDispatch, SelectedUser, OutStockUpdateRequest } from "../../../../types";
import { OutStockInfo } from "./SearchInfo";

import equal from "fast-deep-equal";
const refreshTime = 1000 * 60 * 10;
const dayIntervalRange = 7;

interface QueryResult {
  [date: string]: OutStockInfo[];
}

const OutStockRequestList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryResultFromStore = useSelector((state: RootState) => state.outStockRequests);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<QueryResult>({});
  const [, setUserList] = useState<string[]>([]);
  const [selectedUserList, setSelectedUserList] = useState<SelectedUser[]>([]);
  const [startDate, setStartDate] = useState<Date>(dayOfStart(new Date()));
  const [endDate, setEndDate] = useState<Date>(dayOfEnd(new Date()));
  const [handlingInfo, setHandlingInfo] = useState<OutStockInfo>({} as OutStockInfo);

  const apiCallRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadingWaitHandleList = useCallback(() => {
    setIsLoading(true);
    dispatch(getWaitHandleList()).then(response => {
      if (response.status === 200) {
        setIsLoading(false);
      }
    }).catch((error) => {
      setIsLoading(false);
      notifyRequestFailed(error);
    });
  }, [dispatch]);

  const getInitialState = useCallback(() => {
    setIsLoading(false);
    setModalShow(false);
    setQueryResult({});
    setUserList([]);
    setSelectedUserList([]);
    setStartDate(dayOfStart(new Date()));
    setEndDate(dayOfEnd(new Date()));
    setHandlingInfo({} as OutStockInfo);

    loadingWaitHandleList();
  }, [loadingWaitHandleList]);

  // componentDidMount and componentWillUnmount replacement
  useEffect(() => {
    loadingWaitHandleList();

    apiCallRef.current = setInterval(() => {
      loadingWaitHandleList();
    }, refreshTime);

    return () => {
      if (apiCallRef.current) {
        clearInterval(apiCallRef.current);
      }
    };
  }, [loadingWaitHandleList]);

  // getDerivedStateFromProps replacement: compare the store with the list on screen (not
  // with the last store value), so when getInitialState clears the list after an action it is
  // refilled even if the next query returns the same list.
  useEffect(() => {
    if (queryResultFromStore === undefined) {
      return;
    }

    const newQueryResult = (queryResultFromStore.outStockRequests?.queryResult as QueryResult | undefined) || {};

    if (!equal(queryResult, newQueryResult)) {
      const selectedList: SelectedUser[] = [];

      if (queryResultFromStore.outStockRequests?.userList !== undefined) {
        queryResultFromStore.outStockRequests.userList
          .sort()
          .forEach((element, index) => {
            selectedList.push({
              user: element,
              selected: true,
              index: index
            });
          });
      }

      setQueryResult(newQueryResult);
      setUserList(queryResultFromStore.outStockRequests?.userList || []);
      setSelectedUserList(selectedList);
    }
  }, [queryResultFromStore, queryResult]);

  // The date picker passes null when its text is cleared; keep the previous date then.
  const handleStartDateSelection = useCallback((date: Date | null) => {
    if (date) {
      setStartDate(dayOfStart(date));
    }
  }, []);

  const handleEndDateSelection = useCallback((date: Date | null) => {
    if (date) {
      setEndDate(dayOfEnd(date));
    }
  }, []);

  const handleDateSelectionModeClick = useCallback(() => {
    const startDateStr = startDate.toJSON().substring(0, 19);
    const endDateStr = endDate.toJSON().substring(0, 19);

    setIsLoading(true);
    dispatch(getWaitHandleListWithInterval(startDateStr, endDateStr)).then(response => {
      if (response.status === 200) {
        setIsLoading(false);
      }
    }).catch((error) => {
      setIsLoading(false);
      notifyRequestFailed(error);
    });
  }, [dispatch, startDate, endDate]);

  const handleSubmitClick = useCallback((outStockUpdateRequest: OutStockUpdateRequest) => {
    setIsLoading(true);
    dispatch(updateOutStockRequests(outStockUpdateRequest)).then(res => {
      if (res.status === 200) {
        getInitialState();
      }
    }).catch((error) => {
      setIsLoading(false);
      notifyRequestFailed(error);
    });
  }, [dispatch, getInitialState]);

  const handleUserSelectAll = useCallback(() => {
    const listCopy = copy(selectedUserList) as SelectedUser[];
    listCopy.forEach(user => (user.selected = true));
    setSelectedUserList(listCopy);
  }, [selectedUserList]);

  const handleUserUnselectAll = useCallback(() => {
    const listCopy = copy(selectedUserList) as SelectedUser[];
    listCopy.forEach(user => (user.selected = false));
    setSelectedUserList(listCopy);
  }, [selectedUserList]);

  const handleUserSelection = useCallback((index: number) => {
    const originCopy = [...selectedUserList];
    const objectCopy = Object.assign({}, originCopy[index]);

    objectCopy.selected = !objectCopy.selected;
    originCopy[index] = objectCopy;

    setSelectedUserList(originCopy);
  }, [selectedUserList]);

  const handleDeleteClick = useCallback((info: OutStockInfo) => {
    setModalShow(true);
    setHandlingInfo(info);
  }, []);

  const handleRollBackShipStatus = useCallback((id: number) => {
    setIsLoading(true);
    dispatch(stockIdentifierIsNotShiped(id)).then(res => {
      if (res.status === 200) {
        getInitialState();
      }
    }).catch((error) => {
      setIsLoading(false);
      notifyRequestFailed(error);
    });
  }, [dispatch, getInitialState]);

  const handleDeleteOutStockRequest = useCallback((id: number) => {
    setIsLoading(true);
    dispatch(deleteOutStockRequest(id)).then(res => {
      if (res.status === 200) {
        getInitialState();
      }
    }).catch((error) => {
      setIsLoading(false);
      notifyRequestFailed(error);
    });
  }, [dispatch, getInitialState]);

  const handleDownloadClick = useCallback((e: { target: { name: string; value: string } }) => {
    downloadFile(e.target.name, e.target.value);
  }, []);

  const handleModalShow = useCallback(() => {
    setModalShow(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalShow(false);
  }, []);

  return (
    <div className="outStock_list">
      <div className="container">
        {/* Page Header - RWD Support */}
        <div
          className="page-header-responsive"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            marginBottom: 'var(--spacing-4)',
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
            <h4
              style={{
                margin: 0,
                color: 'var(--color-gray-800)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
              }}
            >
              <i className="fa fa-truck me-2" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              拉貨明細表
            </h4>
            <p
              className="d-none d-md-block"
              style={{
                margin: 0,
                marginTop: 'var(--spacing-1)',
                color: 'var(--color-gray-500)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              管理出庫請求及追蹤處理狀態
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--spacing-2)',
              flex: '0 0 auto',
            }}
          >
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm btn-md-regular"
              onClick={getInitialState}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)',
                whiteSpace: 'nowrap',
              }}
            >
              <i className="fa fa-refresh" aria-hidden="true" />
              <span className="d-none d-sm-inline">頁面初始化</span>
              <span className="d-sm-none">重設</span>
            </button>
            <DatePeriodSelectModal
              btnTitle={"時間區間查詢"}
              btnSize="sm"
              fileType="outStockRequest"
              startDate={startDate}
              endDate={endDate}
              handleStartDateSelection={handleStartDateSelection}
              handleEndDateSelection={handleEndDateSelection}
              handleDateSelectionModeClick={handleDateSelectionModeClick}
              dayRange={dayIntervalRange}
            />
          </div>
        </div>

        {/* User Selection Section */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: 'var(--spacing-4)',
            marginBottom: 'var(--spacing-4)',
          }}
        >
          <h6
            style={{
              color: 'var(--color-gray-700)',
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--spacing-3)',
            }}
          >
            <i className="fa fa-users me-2" style={{ color: 'var(--color-info)' }} aria-hidden="true" />
            使用者篩選
          </h6>
          <UserSelection
            selectedUserList={selectedUserList}
            handleSelectAll={handleUserSelectAll}
            handleUnselectAll={handleUserUnselectAll}
            handleUserSelection={handleUserSelection}
          />
        </div>

        {/* Main Content */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          <LoadingOverlay active={isLoading} spinner={<Spinner />}>
            <div style={{ height: "65vh" }}>
              <SearchBoard
                queryResult={queryResult}
                selectedUserList={selectedUserList}
                handleSubmitClick={handleSubmitClick}
                handleDeleteClick={handleDeleteClick}
                downloadFile={handleDownloadClick}
                handleModalShow={handleModalShow}
                initialize={getInitialState}
              />
            </div>
            {modalShow ? (
              <ConfirmModal
                show
                searchInfo={handlingInfo}
                handleModalClose={handleModalClose}
                cancelShip={handleRollBackShipStatus}
                deleteOutStock={handleDeleteOutStockRequest}
              />
            ) : null}
          </LoadingOverlay>
        </div>
      </div>
    </div>
  );
};

export default OutStockRequestList;
