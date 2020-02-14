import React, { Component } from "react";
import PropTypes from "prop-types";
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

const equal = require("fast-deep-equal");
const refreshTime = 1000 * 60 * 10;
const dayIntervalRange = 7;

class OutStockRequestList extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      modalShow: false,
      queryResult: {},
      userList: [],
      selectedUserList: [],
      startDate: dayOfStart(new Date()),
      endDate: dayOfEnd(new Date()),
      selectedOutStockRequest: [],
      handlingInfo: {}
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
      queryResult: {},
      userList: [],
      selectedUserList: [],
      startDate: dayOfStart(new Date()),
      endDate: dayOfEnd(new Date()),
      selectedOutStockRequest: [],
      handlingInfo: {}
    });

    this.loadingWaitHandleList();
  }

  loadingWaitHandleList() {
    this.setState({ isLoading: true }, () => {
      this.props.getWaitHandleList().then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  initialSelectedUserList(userList) {
    let selectedList = [];

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

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps === undefined) {
      return null;
    }

    if (
      !equal(
        prevState.queryResult,
        nextProps.queryResult.outStockRequests.queryResult
      )
    ) {
      let selectedList = [];

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

  handleStartDateSelection(date) {
    this.setState({ startDate: dayOfStart(date) });
  }

  handleEndDateSelection(date) {
    this.setState({ endDate: dayOfEnd(date) });
  }

  handleDateSelectionModeClick() {
    let startDate = this.state.startDate.toJSON().substring(0, 19);
    let endDate = this.state.endDate.toJSON().substring(0, 19);

    this.setState({ isLoading: true }, () => {
      this.props
        .getWaitHandleListWithInterval(startDate, endDate)
        .then(response => {
          if (response.status === 200) {
            this.setState({ isLoading: false });
          }
        });
    });
  }

  handleSubmitClick(outStockUpdateRequest) {
    this.setState({ isLoading: true }, () => {
      this.props.updateOutStockRequests(outStockUpdateRequest).then(res => {
        if (res.status === 200) {
          this.getInitialState();
        }
      });
    });
  }

  handleUserSelectAll() {
    let listCopy = copy(this.state.selectedUserList);

    listCopy.forEach(user => (user.selected = true));

    this.setState({ selectedUserList: listCopy });
  }

  handleUserUnselectAll() {
    let listCopy = copy(this.state.selectedUserList);

    listCopy.forEach(user => (user.selected = false));

    this.setState({ selectedUserList: listCopy });
  }

  handleUserSelection(index) {
    let originCopy = [...this.state.selectedUserList];
    let objectCopy = Object.assign({}, originCopy[index]);

    objectCopy.selected = !objectCopy.selected;
    originCopy[index] = objectCopy;

    this.setState({
      selectedUserList: originCopy
    });
  }

  handleDeleteClick(info) {
    this.setState({ modalShow: true, handlingInfo: info });
  }

  handleRollBackShipStatus(id) {
    this.setState({ isLoading: true }, () => {
      this.props.stockIdentifierIsNotShiped(id).then(res => {
        if (res.status === 200) {
          this.getInitialState();
        }
      });
    });
  }

  handleDeleteOutStockRequest(id) {
    this.setState({ isLoading: true }, () => {
      this.props.deleteOutStockRequest(id).then(res => {
        if (res.status === 200) {
          this.getInitialState();
        }
      });
    });
  }

  handleDownloadClick(e) {
    downloadFile(e.target.name, e.target.value);
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
                tyep="button"
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

OutStockRequestList.propTypes = {
  queryResult: PropTypes.object.isRequired,
  getWaitHandleList: PropTypes.func.isRequired,
  getWaitHandleListWithInterval: PropTypes.func.isRequired,
  updateOutStockRequests: PropTypes.func.isRequired,
  stockIdentifierIsNotShiped: PropTypes.func.isRequired,
  deleteOutStockRequest: PropTypes.func.isRequired,
  downloadFile: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  queryResult: state.outStockRequests
});

export default connect(mapStateToProps, {
  getWaitHandleList,
  getWaitHandleListWithInterval,
  updateOutStockRequests,
  stockIdentifierIsNotShiped,
  deleteOutStockRequest,
  downloadFile
})(OutStockRequestList);
