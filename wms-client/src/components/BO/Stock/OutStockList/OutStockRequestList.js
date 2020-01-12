import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import UserSelection from "./UserSelection";
import SearchBoard from "./SearchBoard";
import {
  getWaitHandleList,
  getWaitHandleListWithInterval,
  updateOutStockRequests,
  stockIndentifierIsNotShiped,
  deleteOutStockRequest
} from "../../../../actions/StockAcions";
import "react-datepicker/dist/react-datepicker.css";
import { copy } from "../../../../utilities/DeepCopy";
import DatePeriodSelectModal from "../Utilities/DatePeriodSelectModal";
import { dayOfStart, dayOfEnd } from "../Utilities/DateUtils";

const equal = require("fast-deep-equal");
const refreshTime = 1000 * 60 * 10;

class OutStockRequestList extends Component {
  constructor() {
    super();
    this.state = {
      queryResult: {},
      userList: [],
      selectedUserList: [],
      startDate: dayOfStart(new Date()),
      endDate: dayOfEnd(new Date()),
      selectedOutStockRequest: []
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
    this.handleRollBackShipStatus = this.handleRollBackShipStatus.bind(this);
    this.handleDeleteOutStockRequest = this.handleDeleteOutStockRequest.bind(
      this
    );
  }

  getInitialState() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }

    this.setState({
      queryResult: {},
      userList: [],
      selectedUserList: [],
      startDate: dayOfStart(new Date()),
      endDate: dayOfEnd(new Date()),
      selectedOutStockRequest: []
    });

    this.props.getWaitHandleList();
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
    this.props.getWaitHandleList();
    this.apiCall = setInterval(() => {
      this.props.getWaitHandleList();
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

    this.props.getWaitHandleListWithInterval(startDate, endDate);
  }

  handleSubmitClick(outStockUpdateRequest) {
    this.props.updateOutStockRequests(outStockUpdateRequest).then(res => {
      if (res.status === 200) {
        this.getInitialState();
      }
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

  handleRollBackShipStatus(id) {
    this.props.stockIndentifierIsNotShiped(id).then(res => {
      if (res.status === 200) {
        this.getInitialState();
      }
    });
  }

  handleDeleteOutStockRequest(id) {
    this.props.deleteOutStockRequest(id).then(res => {
      if (res.status === 200) {
        this.getInitialState();
      }
    });
  }

  render() {
    const { queryResult, selectedUserList, startDate, endDate } = this.state;

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
                dayRange={7}
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
          <SearchBoard
            queryResult={queryResult}
            selectedUserList={selectedUserList}
            handleSubmitClick={this.handleSubmitClick}
            cancelShip={this.handleRollBackShipStatus}
            deleteOutStock={this.handleDeleteOutStockRequest}
            initialize={this.getInitialState}
          />
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
  stockIndentifierIsNotShiped: PropTypes.func.isRequired,
  deleteOutStockRequest: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  queryResult: state.outStockRequests
});

export default connect(mapStateToProps, {
  getWaitHandleList,
  getWaitHandleListWithInterval,
  updateOutStockRequests,
  stockIndentifierIsNotShiped,
  deleteOutStockRequest
})(OutStockRequestList);
