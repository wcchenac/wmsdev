import React, { Component } from "react";
import { connect } from "react-redux";
import UserSelection from "./UserSelection";
import SearchBoard from "./SearchBoard";
import {
  getWaitHandleList,
  getWaitHandleListWithInterval,
  updateOutStockRequests,
  stockIdentifierIsNotShiped,
  deleteOutStockRequest
} from "../../../../actions/StockAcions";
import { downloadFile } from "../../../../actions/FileActions";
import "react-datepicker/dist/react-datepicker.css";
import { copy } from "../../../../utilities/DeepCopy";
import DatePeriodSelectModal from "../Utilities/DatePeriodSelectModal";
import { dayOfStart, dayOfEnd } from "../Utilities/DateUtils";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import ConfirmModal from "./ConfirmModal";

import equal from "fast-deep-equal";

import type { RootState } from "../../../../types/state";
import type { ApiStatus, OutStockRequestRecord } from "../../../../types/domain";
import type { SelectedUser } from "./UserSelection";

interface ListedUser extends SelectedUser {
  index: number;
}

interface HandlePayload {
  userList?: string[];
  queryResult?: Record<string, OutStockRequestRecord[]>;
}

interface StateProps {
  queryResult: { outStockRequests: HandlePayload };
}

interface DispatchProps {
  getWaitHandleList: () => Promise<ApiStatus | undefined>;
  getWaitHandleListWithInterval: (start: string, end: string) => Promise<ApiStatus | undefined>;
  updateOutStockRequests: (request: { outStockUpdate: Record<string, string> }) => Promise<ApiStatus | undefined>;
  stockIdentifierIsNotShiped: (id: number) => Promise<ApiStatus | undefined>;
  deleteOutStockRequest: (id: number) => Promise<ApiStatus | undefined>;
  downloadFile: (category: string, filename: string) => void;
}

type Props = StateProps & DispatchProps;

interface State {
  isLoading: boolean;
  modalShow: boolean;
  queryResult: Record<string, OutStockRequestRecord[]>;
  userList: string[];
  selectedUserList: ListedUser[];
  startDate: Date;
  endDate: Date;
  selectedOutStockRequest: OutStockRequestRecord[];
  handlingInfo: OutStockRequestRecord;
}

const refreshTime = 1000 * 60 * 10;
const dayIntervalRange = 7;

interface OutStockRequestList {
  apiCall?: ReturnType<typeof setInterval>;
}

class OutStockRequestList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      modalShow: false,
      queryResult: {} as State['queryResult'],
      userList: [],
      selectedUserList: [],
      startDate: dayOfStart(new Date()),
      endDate: dayOfEnd(new Date()),
      selectedOutStockRequest: [],
      handlingInfo: {} as OutStockRequestRecord
    };
    this.getInitialState = this.getInitialState.bind(this);
    this.handleStartDateSelection = this.handleStartDateSelection.bind(this);
    this.handleEndDateSelection = this.handleEndDateSelection.bind(this);
    this.handleDateSelectionModeClick = this.handleDateSelectionModeClick.bind(
      this
    );
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleUserSelection = this.handleUserSelection.bind(this);
    this.handleUserSelectAll = this.handleUserSelectAll.bind(this);
    this.handleUserUnselectAll = this.handleUserUnselectAll.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleRollBackShipStatus = this.handleRollBackShipStatus.bind(this);
    this.handleDeleteOutStockRequest = this.handleDeleteOutStockRequest.bind(
      this
    );
    this.handleDownloadClick = this.handleDownloadClick.bind(this);
    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
  }

  getInitialState() {
    this.setState({
      isLoading: false,
      modalShow: false,
      queryResult: {} as State['queryResult'],
      userList: [],
      selectedUserList: [],
      startDate: dayOfStart(new Date()),
      endDate: dayOfEnd(new Date()),
      selectedOutStockRequest: [],
      handlingInfo: {} as OutStockRequestRecord
    });

    this.loadingWaitHandleList();
  }

  loadingWaitHandleList() {
    this.setState({ isLoading: true }, () => {
      this.props.getWaitHandleList().then(response => {
        if (response?.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  initialSelectedUserList(userList: string[]): ListedUser[] {
    const selectedList: ListedUser[] = [];

    userList.sort().forEach((element, index) => {
      selectedList.push({
        user: element,
        selected: true,
        index: index
      });
    });

    return selectedList;
  }

  componentDidMount() {
    this.loadingWaitHandleList();

    this.apiCall = setInterval(() => {
      this.loadingWaitHandleList();
    }, refreshTime);
  }

  componentWillUnmount() {
    clearInterval(this.apiCall);
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
    if (nextProps === undefined) {
      return null;
    }

    if (
      !equal(
        prevState.queryResult,
        nextProps.queryResult.outStockRequests.queryResult
      )
    ) {
      const selectedList: ListedUser[] = [];

      if (nextProps.queryResult.outStockRequests.userList !== undefined) {
        nextProps.queryResult.outStockRequests.userList
          .sort()
          .forEach((element, index) => {
            selectedList.push({
              user: element,
              selected: true,
              index: index
            });
          });
      }

      return {
        ...prevState,
        queryResult: nextProps.queryResult.outStockRequests.queryResult,
        userList: nextProps.queryResult.outStockRequests.userList,
        selectedUserList: selectedList
      };
    } else {
      return null;
    }
  }

  handleStartDateSelection(date: Date | null) {
    this.setState({ startDate: dayOfStart(date as Date) });
  }

  handleEndDateSelection(date: Date | null) {
    this.setState({ endDate: dayOfEnd(date as Date) });
  }

  handleDateSelectionModeClick() {
    let startDate = this.state.startDate.toJSON().substring(0, 19);
    let endDate = this.state.endDate.toJSON().substring(0, 19);

    this.setState({ isLoading: true }, () => {
      this.props
        .getWaitHandleListWithInterval(startDate, endDate)
        .then(response => {
          if (response?.status === 200) {
            this.setState({ isLoading: false });
          }
        });
    });
  }

  handleSubmitClick(outStockUpdateRequest: { outStockUpdate: Record<string, string> }) {
    this.setState({ isLoading: true }, () => {
      this.props.updateOutStockRequests(outStockUpdateRequest).then(res => {
        if (res?.status === 200) {
          this.getInitialState();
        }
      });
    });
  }

  handleUserSelectAll() {
    const listCopy = copy(this.state.selectedUserList) as ListedUser[];

    listCopy.forEach(user => (user.selected = true));

    this.setState({ selectedUserList: listCopy });
  }

  handleUserUnselectAll() {
    const listCopy = copy(this.state.selectedUserList) as ListedUser[];

    listCopy.forEach(user => (user.selected = false));

    this.setState({ selectedUserList: listCopy });
  }

  handleUserSelection(index: number) {
    let originCopy = [...this.state.selectedUserList];
    let objectCopy = Object.assign({}, originCopy[index]);

    objectCopy.selected = !objectCopy.selected;
    originCopy[index] = objectCopy;

    this.setState({
      selectedUserList: originCopy
    });
  }

  handleDeleteClick(info: OutStockRequestRecord) {
    this.setState({ modalShow: true, handlingInfo: info });
  }

  handleRollBackShipStatus(id: number) {
    this.setState({ isLoading: true }, () => {
      this.props.stockIdentifierIsNotShiped(id).then(res => {
        if (res?.status === 200) {
          this.getInitialState();
        }
      });
    });
  }

  handleDeleteOutStockRequest(id: number) {
    this.setState({ isLoading: true }, () => {
      this.props.deleteOutStockRequest(id).then(res => {
        if (res?.status === 200) {
          this.getInitialState();
        }
      });
    });
  }

  handleDownloadClick(e: React.MouseEvent<HTMLButtonElement>) {
    downloadFile(e.currentTarget.name, e.currentTarget.value);
  }

  handleModalShow() {
    this.setState({ modalShow: true });
  }

  handleModalClose() {
    this.setState({ modalShow: false });
  }

  render() {
    const {
      isLoading,
      queryResult,
      selectedUserList,
      startDate,
      endDate,
      modalShow,
      handlingInfo
    } = this.state;

    return (
      <div className="outStock_list">
        <div className="container">
          <p className="h3 text-center">拉貨明細表</p>
          <div className="col">
            <div className="row justify-content-end">
              <button
                {...({ tyep: "button" } as React.ButtonHTMLAttributes<HTMLButtonElement>)}
                className="btn btn-info mr-2"
                onClick={this.getInitialState}
              >
                頁面初始化
              </button>
              <DatePeriodSelectModal
                btnTitle={"時間區間查詢"}
                startDate={startDate}
                endDate={endDate}
                handleStartDateSelection={this.handleStartDateSelection}
                handleEndDateSelection={this.handleEndDateSelection}
                handleDateSelectionModeClick={this.handleDateSelectionModeClick}
                dayRange={dayIntervalRange}
              />
            </div>
          </div>
          <hr />
          <UserSelection
            selectedUserList={selectedUserList}
            handleSelectAll={this.handleUserSelectAll}
            handleUnselectAll={this.handleUserUnselectAll}
            handleUserSelection={this.handleUserSelection}
          />
          <hr />
          <LoadingOverlay active={isLoading} spinner={<Spinner />}>
            <div style={{ height: "65vh" }}>
              <SearchBoard
                queryResult={queryResult}
                selectedUserList={selectedUserList}
                handleSubmitClick={this.handleSubmitClick}
                handleDeleteClick={this.handleDeleteClick}
                downloadFile={this.handleDownloadClick}
                handleModalShow={this.handleModalShow}
                initialize={this.getInitialState}
              />
            </div>
            {modalShow ? (
              <ConfirmModal
                show
                searchInfo={handlingInfo}
                handleModalClose={this.handleModalClose}
                cancelShip={this.handleRollBackShipStatus}
                deleteOutStock={this.handleDeleteOutStockRequest}
              />
            ) : null}
          </LoadingOverlay>
        </div>
      </div>
    );
  }
}


const mapStateToProps = (state: RootState): StateProps => ({
  queryResult: state.outStockRequests as unknown as StateProps["queryResult"]
});

export default connect(mapStateToProps, {
  getWaitHandleList,
  getWaitHandleListWithInterval,
  updateOutStockRequests,
  stockIdentifierIsNotShiped,
  deleteOutStockRequest,
  downloadFile
})(OutStockRequestList);
