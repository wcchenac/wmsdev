import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import UserSelection from "./UserSelection";
import SearchBoard from "./SearchBoard";
import {
  getWaitHandleList,
  getWaitHandleListWithInterval
} from "../../../../actions/ClothInfoAcions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { trackPromise } from "react-promise-tracker";

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
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.handleUnselectAll = this.handleUnselectAll.bind(this);
  }

  getInitialState() {
    this.setState({
      queryResult: {},
      userList: [],
      selectedUserList: [],
      startDate: this.dayOfStart(new Date()),
      endDate: this.dayOfEnd(new Date()),
      selectedOutStockRequest: []
    });

    trackPromise(this.props.getWaitHandleList());
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

    this.setState({ selectedUserList: selectedList });
  }

  componentDidMount() {
    trackPromise(this.props.getWaitHandleList());
    this.initialSelectedUserList(this.state.userList);
  }

  componentDidUpdate(prevProps) {
    if (this.props.queryResult !== prevProps.queryResult) {
      this.setState(
        {
          queryResult: this.props.queryResult.outStockRequests.queryResult,
          userList: this.props.queryResult.outStockRequests.userList
        },
        this.initialSelectedUserList(
          this.props.queryResult.outStockRequests.userList
        )
      );
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

    trackPromise(this.props.getWaitHandleListWithInterval(startDate, endDate));
  }

  handleSubmitClick() {
    // TODO: update selected items and download file
  }

  handleSelectAll() {
    const { selectedUserList } = this.state;

    selectedUserList.forEach(user => (user.selected = true));

    this.setState({ selectedUserList: selectedUserList });
  }

  handleUnselectAll() {
    const { selectedUserList } = this.state;

    selectedUserList.forEach(user => (user.selected = false));

    this.setState({ selectedUserList: selectedUserList });
  }

  handleUserSelection(index) {
    const { selectedUserList } = this.state;
    let selected = selectedUserList[index].selected;

    selectedUserList[index].selected = !selected;

    this.setState({ selectedUserList: selectedUserList });
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
            handleSelectAll={this.handleSelectAll}
            handleUnselectAll={this.handleUnselectAll}
            handleUserSelection={this.handleUserSelection}
          />
          <div className="float-right">
            <button className="btn btn-primary">匯出檔案</button>
          </div>
          <br />
          <hr />
          <SearchBoard
            queryResult={queryResult}
            selectedUserList={selectedUserList}
          />
        </div>
      </div>
    );
  }
}

OutStockRequestList.propTypes = {
  queryResult: PropTypes.object.isRequired,
  getWaitHandleList: PropTypes.func.isRequired,
  getWaitHandleListWithInterval: PropTypes.func.isRequired
};

const mapStateToProps = state => ({ queryResult: state.outStockRequests });

export default connect(
  mapStateToProps,
  { getWaitHandleList, getWaitHandleListWithInterval }
)(OutStockRequestList);
