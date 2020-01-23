import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Nav, TabContainer, TabContent, TabPane } from "react-bootstrap";
import QueryOrder from "./Common/QueryOrder";
import SelectionBoard from "./Common/SelectionBoard";
import EditBoard from "./Common/EditBoard";
import {
  getInStockOrder,
  batchCreateStockInfoes
} from "../../../../actions/StockAcions";
import { checkWaitHandleStatusCompletion } from "../Utilities/ValidateQueryOrderResponse";
import { isEmpty } from "../../../../utilities/IsEmpty";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";

class NormalStockBoard extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      orderNo: "",
      isOrderValid: undefined,
      key: 1,
      currentOrderStatus: {},
      waitHandleStatus: {},
      selectedProductNoList: []
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
      selectedProductNoList: []
    });
  }

  initialSelectedList(currentOrderStatus) {
    if (!isEmpty(currentOrderStatus)) {
      let selectedList = [];

      Object.keys(currentOrderStatus)
        .sort()
        .forEach((element, index) => {
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

  handleOrderNo(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleQueryOrderSubmit(e) {
    e.preventDefault();

    this.setState({ isLoading: true }, () => {
      this.props.getInStockOrder(this.state.orderNo).then(response => {
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
      selected: checked
    };

    this.setState({
      selectedProductNoList: copyList
    });
  }

  handleInStockRequestSubmit(e, index, inStockRequests) {
    e.preventDefault();
    const copyList = [...this.state.selectedProductNoList];

    this.setState({ isLoading: true }, () => {
      this.props.batchCreateStockInfoes(inStockRequests).then(res => {
        if (res.status === 200) {
          copyList[index] = {
            ...this.state.selectedProductNoList[index],
            isSubmitted: true
          };

          this.setState({
            isLoading: false,
            selectedProductNoList: copyList
          });
        }
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.queryInStockOrderResult !== prevProps.queryInStockOrderResult
    ) {
      this.setState(
        {
          currentOrderStatus: this.props.queryInStockOrderResult.stockInfoes
            .currentStatus,
          waitHandleStatus: this.props.queryInStockOrderResult.stockInfoes
            .waitHandleStatus
        },
        function() {
          if (
            isEmpty(this.state.currentOrderStatus) ||
            checkWaitHandleStatusCompletion(this.state.waitHandleStatus)
          ) {
            this.setState({ isOrderValid: false });
          } else {
            this.initialSelectedList(this.state.currentOrderStatus);
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
      key
    } = this.state;

    return (
      <div className="batch_add_stockInfo">
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
                  <LoadingOverlay
                    active={isLoading && key === 1}
                    spinner={<Spinner />}
                  >
                    <div style={{ height: "80vh" }}>
                      <QueryOrder
                        type="進貨單"
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
                    type="進貨單"
                    orderNo={orderNo}
                    waitHandleStatus={waitHandleStatus}
                    selectedProductNoList={selectedProductNoList}
                    handleCheckBoxSelected={this.handleCheckBoxSelected}
                  />
                </div>
              </TabPane>
              <TabPane eventKey={3}>
                <div className="container">
                  <EditBoard
                    isLoading={isLoading && key === 3}
                    type="normal"
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

NormalStockBoard.propTypes = {
  queryInStockOrderResult: PropTypes.object.isRequired,
  getInStockOrder: PropTypes.func.isRequired,
  batchCreateStockInfoes: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  queryInStockOrderResult: state.stockInfo,
  errors: state.errors
});

export default connect(mapStateToProps, {
  getInStockOrder,
  batchCreateStockInfoes
})(NormalStockBoard);
