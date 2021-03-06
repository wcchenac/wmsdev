import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Nav, TabContainer, TabContent, TabPane } from "react-bootstrap";
import QueryOrder from "./Common/QueryOrder";
import SelectionBoard from "./Common/SelectionBoard";
import EditBoard from "./Common/EditBoard";
import {
  getStoreReturnOrder,
  batchCreateStockInfoes,
} from "../../../../actions/StockAcions";
import {
  checkWaitHandleStatusCompletion,
  checkWaitHandleProductStatus,
} from "../Utilities/ValidateQueryOrderResponse";
import { isEmpty } from "../../../../utilities/IsEmpty";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";

class StoreReturnBoard extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      orderNo: "",
      isOrderValid: undefined,
      key: 1,
      currentOrderStatus: {},
      waitHandleStatus: {},
      selectedProductNoList: [],
    };
    this.getInitialize = this.getInitialize.bind(this);
    this.handlePrevStep = this.handlePrevStep.bind(this);
    this.handleNextStep = this.handleNextStep.bind(this);
    this.handleOrderNo = this.handleOrderNo.bind(this);
    this.handleQueryOrderSubmit = this.handleQueryOrderSubmit.bind(this);
    this.handleCheckBoxSelected = this.handleCheckBoxSelected.bind(this);
    this.handleInStockRequestSubmit = this.handleInStockRequestSubmit.bind(
      this
    );
    this.handleSelectionClick = this.handleSelectionClick.bind(this);
  }

  getInitialize() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }

    this.setState({
      isLoading: false,
      isOrderValid: undefined,
      key: 1,
      currentOrderStatus: {},
      waitHandleStatus: {},
      selectedProductNoList: [],
    });
  }

  initialSelectedList(currentOrderStatus, waitHandleStatus) {
    if (!isEmpty(currentOrderStatus)) {
      let selectedList = [];

      Object.keys(currentOrderStatus)
        .sort()
        .forEach((element, index) => {
          selectedList.push({
            productNo: element.toString(),
            selected: checkWaitHandleProductStatus(
              waitHandleStatus[element.toString()]
            ),
            index: index,
            isSubmitted: false,
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
      key: this.state.key - 1,
    });
  }

  handleNextStep() {
    this.setState({
      key: this.state.key + 1,
    });
  }

  handleOrderNo(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleQueryOrderSubmit(e) {
    e.preventDefault();

    this.setState({ isLoading: true }, () => {
      this.props.getStoreReturnOrder(this.state.orderNo).then((response) => {
        if (response.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  handleCheckBoxSelected(e, index) {
    const { checked } = e.target;
    const copyList = [...this.state.selectedProductNoList];

    copyList[index] = {
      ...this.state.selectedProductNoList[index],
      selected: checked,
    };

    this.setState({
      selectedProductNoList: copyList,
    });
  }

  handleSelectionClick(e) {
    const copyList = [...this.state.selectedProductNoList];
    let value = e.target.value === "true";

    copyList.forEach((object) => {
      object.selected = value;
    });

    this.setState({
      selectedProductNoList: copyList,
    });
  }

  handleInStockRequestSubmit(e, index, inStockRequests) {
    e.preventDefault();
    const copyList = [...this.state.selectedProductNoList];

    this.setState({ isLoading: true }, () => {
      this.props.batchCreateStockInfoes(inStockRequests).then((res) => {
        if (res.status === 200) {
          copyList[index] = {
            ...this.state.selectedProductNoList[index],
            isSubmitted: true,
          };

          this.setState({
            isLoading: false,
            selectedProductNoList: copyList,
          });
        }
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.queryReturnOrderResult !== prevProps.queryReturnOrderResult
    ) {
      this.setState(
        {
          currentOrderStatus: this.props.queryReturnOrderResult.stockInfoes
            .currentStatus,
          waitHandleStatus: this.props.queryReturnOrderResult.stockInfoes
            .waitHandleStatus,
        },
        function () {
          if (
            isEmpty(this.state.currentOrderStatus) ||
            checkWaitHandleStatusCompletion(this.state.waitHandleStatus)
          ) {
            this.setState({ isOrderValid: false });
          } else {
            this.initialSelectedList(
              this.state.currentOrderStatus,
              this.state.waitHandleStatus
            );
            this.setState({ isOrderValid: true });
            this.handleTabSelect(2);
          }
        }
      );
    }
  }

  render() {
    const {
      isLoading,
      orderNo,
      isOrderValid,
      waitHandleStatus,
      selectedProductNoList,
      key,
    } = this.state;

    return (
      <div className="returnOrder_stockInfo">
        <div className="container">
          <TabContainer
            id="left-tabs"
            activeKey={key}
            onSelect={this.handleTabSelect}
          >
            <Nav justify variant="pills">
              <Nav.Item>
                <Nav.Link eventKey={1} disabled={key !== 1}>
                  Step 1 - 查詢調撥單內容
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
                  <LoadingOverlay
                    active={isLoading && key === 1}
                    spinner={<Spinner />}
                  >
                    <div style={{ height: "80vh" }}>
                      <QueryOrder
                        type="調撥單"
                        handleOrderNo={this.handleOrderNo}
                        handleQueryOrderSubmit={this.handleQueryOrderSubmit}
                        isOrderValid={isOrderValid}
                      />
                    </div>
                  </LoadingOverlay>
                </div>
              </TabPane>
              <TabPane eventKey={2}>
                <div className="container">
                  <SelectionBoard
                    handlePrevStep={this.getInitialize}
                    handleNextStep={this.handleNextStep}
                    type="調撥單"
                    orderNo={orderNo}
                    waitHandleStatus={waitHandleStatus}
                    selectedProductNoList={selectedProductNoList}
                    handleCheckBoxSelected={this.handleCheckBoxSelected}
                    handleSelectionClick={this.handleSelectionClick}
                  />
                </div>
              </TabPane>
              <TabPane eventKey={3}>
                <div className="container">
                  <EditBoard
                    isLoading={isLoading && key === 3}
                    type="storeReturn"
                    handlePrevStep={this.handlePrevStep}
                    orderNo={orderNo}
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

StoreReturnBoard.propTypes = {
  queryReturnOrderResult: PropTypes.object.isRequired,
  getStoreReturnOrder: PropTypes.func.isRequired,
  batchCreateStockInfoes: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  queryReturnOrderResult: state.stockInfo,
  errors: state.errors,
});

export default connect(mapStateToProps, {
  getStoreReturnOrder,
  batchCreateStockInfoes,
})(StoreReturnBoard);
