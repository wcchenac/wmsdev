import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import { Nav, TabContainer, TabContent, TabPane } from "react-bootstrap";
import QueryOrder from "./QueryOrder";
import SelectionBoard from "./SelectionBoard";
import EditBoard from "./EditBoard";
import {
  getInStockOrder,
  batchCreateClothInfoes
} from "../../../../../actions/ClothInfoAcions";
import { isEmpty } from "../../../../../utilities/IsEmpty";

class BatchAddClothInfo extends Component {
  constructor() {
    super();
    this.state = {
      inStockOrderNo: "",
      key: 1,
      currentOrderStatus: {},
      prevOrderStatus: {},
      waitHandleStatus: {},
      selectedProductNoList: []
    };
    this.getInitialize = this.getInitialize.bind(this);
    this.handleTabSelect = this.handleTabSelect.bind(this);
    this.handlePrevStep = this.handlePrevStep.bind(this);
    this.handleNextStep = this.handleNextStep.bind(this);
    this.handleStockOrderNo = this.handleStockOrderNo.bind(this);
    this.handleQueryOrderSubmit = this.handleQueryOrderSubmit.bind(this);
    this.handleCheckBoxSelected = this.handleCheckBoxSelected.bind(this);
    this.handleInStockRequestSubmit = this.handleInStockRequestSubmit.bind(
      this
    );
  }

  getInitialize() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }

    this.setState({
      key: 1,
      currentOrderStatus: {},
      prevOrderStatus: {},
      waitHandleStatus: {},
      selectedProductNoList: []
    });
  }

  initialSelectedList(currentOrderStatus) {
    if (!isEmpty(currentOrderStatus)) {
      let selectedList = [];

      Object.keys(currentOrderStatus).forEach((element, index) => {
        selectedList.push({
          productNo: element.toString(),
          selected: false,
          index: index,
          isSubmitted: false
        });
      });

      this.setState({ selectedProductNoList: selectedList });
    }
  }

  handleTabSelect(key) {
    this.setState({ key });
  }

  handlePrevStep() {
    this.setState({
      key: this.state.key - 1
    });
  }

  handleNextStep() {
    this.setState({
      key: this.state.key + 1
    });
  }

  handleStockOrderNo(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleQueryOrderSubmit(e) {
    e.preventDefault();
    trackPromise(this.props.getInStockOrder(this.state.inStockOrderNo));
    this.handleTabSelect(2);
  }

  handleCheckBoxSelected(e, index) {
    const { checked } = e.target;
    const copyList = [...this.state.selectedProductNoList];

    copyList[index] = {
      ...this.state.selectedProductNoList[index],
      selected: checked
    };

    this.setState({
      selectedProductNoList: copyList
    });
  }

  handleInStockRequestSubmit(e, index, inStockRequests) {
    const copyList = [...this.state.selectedProductNoList];

    e.preventDefault();
    this.props.batchCreateClothInfoes(inStockRequests);

    copyList[index] = {
      ...this.state.selectedProductNoList[index],
      isSubmitted: true
    };

    this.setState({
      selectedProductNoList: copyList
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.queryInStockOrderResult !== prevProps.queryInStockOrderResult
    ) {
      this.setState(
        {
          currentOrderStatus: this.props.queryInStockOrderResult.clothInfoes
            .currentStatus,
          prevOrderStatus: this.props.queryInStockOrderResult.clothInfoes
            .prevStatus,
          waitHandleStatus: this.props.queryInStockOrderResult.clothInfoes
            .waitHandleStatus
        },
        function() {
          this.initialSelectedList(this.state.currentOrderStatus);
        }
      );
    }
  }

  render() {
    const {
      inStockOrderNo,
      waitHandleStatus,
      selectedProductNoList,
      key
    } = this.state;

    return (
      <div className="batch_add_clothInfo">
        <div className="container">
          <TabContainer
            id="left-tabs"
            activeKey={key}
            onSelect={this.handleTabSelect}
          >
            <Nav justify variant="pills">
              <Nav.Item>
                <Nav.Link eventKey={1} disabled={key !== 1}>
                  Step 1 - 查詢進貨單內容
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey={2} disabled={key !== 2}>
                  Step 2 - 選擇入庫貨號
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey={3} disabled={key !== 3}>
                  Step 3 - 輸入詳細資料及送出
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <hr />
            <TabContent>
              <TabPane eventKey={1}>
                <div className="container">
                  <QueryOrder
                    handleStockOrderNo={this.handleStockOrderNo}
                    handleQueryOrderSubmit={this.handleQueryOrderSubmit}
                  />
                </div>
              </TabPane>
              <TabPane eventKey={2}>
                <div className="container">
                  <SelectionBoard
                    handlePrevStep={this.getInitialize}
                    handleNextStep={this.handleNextStep}
                    inStockOrderNo={inStockOrderNo}
                    waitHandleStatus={waitHandleStatus}
                    selectedProductNoList={selectedProductNoList}
                    handleCheckBoxSelected={this.handleCheckBoxSelected}
                  />
                </div>
              </TabPane>
              <TabPane eventKey={3}>
                <div className="container">
                  <EditBoard
                    handlePrevStep={this.handlePrevStep}
                    inStockOrderNo={inStockOrderNo}
                    selectedProductNoList={selectedProductNoList}
                    waitHandleStatus={waitHandleStatus}
                    handleInStockRequestSubmit={this.handleInStockRequestSubmit}
                    getInitialize={this.getInitialize}
                  />
                </div>
              </TabPane>
            </TabContent>
          </TabContainer>
        </div>
      </div>
    );
  }
}

BatchAddClothInfo.propTypes = {
  queryInStockOrderResult: PropTypes.object.isRequired,
  batchCreateClothInfoes: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  queryInStockOrderResult: state.clothInfo
});

export default connect(
  mapStateToProps,
  { getInStockOrder, batchCreateClothInfoes }
)(BatchAddClothInfo);
