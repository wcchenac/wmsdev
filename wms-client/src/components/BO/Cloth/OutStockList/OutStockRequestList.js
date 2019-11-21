import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import UserSelection from "./UserSelection";
import SearchBoard from "./SearchBoard";
import {
  getWaitHandleList,
  getWaitHandleListWithInterval,
  updateOutStockRequests,
  clothIndentifierIsNotShiped,
  deleteOutStockRequest
} from "../../../../actions/ClothInfoAcions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { copy } from "../../../../utilities/DeepCopy";

const equal = require("fast-deep-equal");
const refreshTime = 1000 * 60 * 10;

class OutStockRequestList extends Component {
  constructor() {
    super();
    this.state = {
      queryResult: {},
      userList: [],
      selectedUserList: [],
      startDate: this.dayOfStart(new Date()),
      endDate: this.dayOfEnd(new Date()),
      selectedOutStockRequest: []
    };
    this.getInitialState = this.getInitialState.bind(this);
    this.handleStartDateSelection = this.handleStartDateSelection.bind(this);
    this.handleEndDateSelection = this.handleEndDateSelection.bind(this);
    this.handleTimeSelectionModeClick = this.handleTimeSelectionModeClick.bind(
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
      startDate: this.dayOfStart(new Date()),
      endDate: this.dayOfEnd(new Date()),
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

  dayOfStart(date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    return date;
  }

  dayOfEnd(date) {
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);

    return date;
  }

  handleStartDateSelection(date) {
    this.setState({ startDate: this.dayOfStart(date) });
  }

  handleEndDateSelection(date) {
    this.setState({ endDate: this.dayOfEnd(date) });
  }

  handleTimeSelectionModeClick() {
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

  dateSettingAlgorithm(startDate, endDate) {
    if (endDate < startDate) {
      return true;
    }

    if (endDate - startDate > 86400000 * 7) {
      return true;
    }

    return false;
  }

  handleRollBackShipStatus(id) {
    this.props.clothIndentifierIsNotShiped(id).then(res => {
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
    let wrongDateSetting = this.dateSettingAlgorithm(startDate, endDate);

    return (
      <div className="outStock_list">
        <div className="container">
          <p className="h3 text-center">拉貨明細表</p>
          <div className="float-right">
            <button
              tyep="button"
              className="btn btn-info mr-2"
              onClick={this.getInitialState}
            >
              頁面初始化
            </button>
            <button
              type="button"
              className="btn btn-info"
              data-toggle="modal"
              data-target="#dateCondition"
            >
              時間區間查詢
            </button>
            <div
              className="modal fade"
              id="dateCondition"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="content"
              aria-hidden="true"
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">時間區間查詢</h5>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col">
                        <label>起始日期</label>
                        <DatePicker
                          name="start"
                          selected={startDate}
                          onChange={this.handleStartDateSelection}
                        />
                      </div>
                      <div className="col">
                        <label>結束日期</label>
                        <DatePicker
                          name="end"
                          selected={endDate}
                          onChange={this.handleEndDateSelection}
                        />
                      </div>
                    </div>
                    <small className="text-muted">時間區間最長7天</small>
                    <br />
                    {wrongDateSetting && (
                      <small className="text-danger">
                        日期設定錯誤，請修改日期
                      </small>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-dismiss="modal"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      data-dismiss="modal"
                      disabled={wrongDateSetting}
                      onClick={this.handleTimeSelectionModeClick}
                    >
                      確認
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br />
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
  clothIndentifierIsNotShiped: PropTypes.func.isRequired,
  deleteOutStockRequest: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  queryResult: state.outStockRequests
});

export default connect(
  mapStateToProps,
  {
    getWaitHandleList,
    getWaitHandleListWithInterval,
    updateOutStockRequests,
    clothIndentifierIsNotShiped,
    deleteOutStockRequest
  }
)(OutStockRequestList);
