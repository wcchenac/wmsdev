import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import UserSelection from "./UserSelection";
import BasicSearchBoard from "./BasicSearchBoard";
import AdvancedSearch from "./AdvancedSearch";

class OutStockRequestList extends Component {
  constructor() {
    super();
    this.state = {
      queryResult: {
        "2019-10-01": [
          {
            productNo: "A12345",
            length: 11,
            unit: "碼",
            user: "AA",
            isHandled: false
          },
          {
            productNo: "B23456",
            length: 22,
            unit: "碼",
            user: "BB",
            isHandled: false
          },
          {
            productNo: "C34567",
            length: 33,
            unit: "碼",
            user: "CC",
            isHandled: false
          }
        ]
      },
      userList: ["AA", "BB", "CC"],
      selectedUserList: [],
      advancedMode: false
    };
    this.getInitialState = this.getInitialState.bind(this);
    this.handleAdvancedModeClick = this.handleAdvancedModeClick.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleUserSelection = this.handleUserSelection.bind(this);
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.handleUnselectAll = this.handleUnselectAll.bind(this);
  }

  getInitialState() {
    this.setState({
      queryResult: {
        "2019-10-01": [
          {
            productNo: "A12345",
            length: 11,
            unit: "碼",
            user: "AA",
            isHandled: false
          },
          {
            productNo: "B23456",
            length: 22,
            unit: "碼",
            user: "BB",
            isHandled: false
          },
          {
            productNo: "C34567",
            length: 33,
            unit: "碼",
            user: "CC",
            isHandled: false
          }
        ]
      },
      userList: ["AA", "BB", "CC"],
      selectedUserList: [],
      advancedMode: false
    });
    // call query outStockList API
  }

  initialSelectedUserList(userList) {
    let selectedList = [];

    userList.forEach((element, index) => {
      selectedList.push({
        user: element,
        selected: true,
        index: index
      });
    });

    this.setState({ selectedUserList: selectedList });
  }

  componentDidMount() {
    // call querty outStockList API
    this.initialSelectedUserList(this.state.userList);
  }

  handleAdvancedModeClick() {
    this.setState({
      advancedMode: true
    });
  }

  handleSubmitClick() {
    // save new status to database and download file
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

  render() {
    const { queryResult, selectedUserList, advancedMode } = this.state;

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
              onClick={this.handleAdvancedModeClick}
            >
              進階查詢
            </button>
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
          {advancedMode ? (
            <AdvancedSearch />
          ) : (
            <BasicSearchBoard
              queryResult={queryResult}
              selectedUserList={selectedUserList}
            />
          )}
        </div>
      </div>
    );
  }
}

OutStockRequestList.propTypes = {
  queryResult: PropTypes.object.isRequired
};

const mapStateToProps = state => ({ queryResult: state.clothInfo });

export default connect(
  mapStateToProps,
  {}
)(OutStockRequestList);
