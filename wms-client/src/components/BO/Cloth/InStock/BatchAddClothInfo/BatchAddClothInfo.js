import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Nav, TabContainer, TabContent, TabPane } from "react-bootstrap";
import QueryOrder from "./QueryOrder";
import SelectionBoard from "./SelectionBoard";
import EditBoard from "./EditBoard";
import { batchCreateClothInfoes } from "../../../../../actions/ClothInfoAcions";

class BatchAddClothInfo extends Component {
  constructor() {
    super();
    this.state = {
      inStockOrderNo: "",
      key: 1,
      queryProductNoList: [],
      selectedProductNoList: []
    };
    this.handleTabSelect = this.handleTabSelect.bind(this);
    this.handlePrevStep = this.handlePrevStep.bind(this);
    this.handleNextStep = this.handleNextStep.bind(this);
    this.handleStockOrderNo = this.handleStockOrderNo.bind(this);
    this.handleQueryOrderSubmit = this.handleQueryOrderSubmit.bind(this);
    this.handleCheckBoxSelected = this.handleCheckBoxSelected.bind(this);
    this.handleInStockRequestSubmit = this.handleInStockRequestSubmit.bind(
      this
    );
    this.getInitialize = this.getInitialize.bind(this);
  }

  getInitialize() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }

    this.setState({
      inStockOrderNo: "",
      key: 1,
      queryProductNoList: [],
      selectedProductNoList: []
    });
  }

  handleTabSelect(key) {
    this.setState({ key });
  }

  handlePrevStep() {
    const { key } = this.state;

    this.setState({
      key: key - 1
    });
  }

  handleNextStep() {
    const { key } = this.state;

    this.setState({
      key: key + 1
    });
  }

  handleStockOrderNo(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  initialSelectedList(queryProductNoList) {
    let selectedList = [];

    queryProductNoList.forEach((element, index) => {
      selectedList.push({
        productNo: element,
        selected: false,
        index: index,
        isSubmitted: false
      });
    });

    this.setState({ selectedProductNoList: selectedList });
  }

  handleQueryOrderSubmit(e) {
    e.preventDefault();
    //receive order content (productNolist) and store at props
    this.setState(
      { queryProductNoList: ["A12345", "B23456", "C34567", "D45678"] },
      function() {
        this.initialSelectedList(this.state.queryProductNoList);
      }
    );

    this.handleTabSelect(2);
  }

  handleCheckBoxSelected(e, index) {
    const { checked } = e.target;
    const { selectedProductNoList } = this.state;

    selectedProductNoList[index].selected = checked;

    this.setState({
      selectedProductNoList: selectedProductNoList
    });
  }

  handleInStockRequestSubmit(e, index, inStockRequests) {
    const { selectedProductNoList } = this.state;

    e.preventDefault();
    this.props.batchCreateClothInfoes(inStockRequests);
    selectedProductNoList[index].isSubmitted = true;

    this.setState({
      selectedProductNoList: selectedProductNoList
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.queryProductNoList !== prevProps.queryProductNoList) {
      this.setState({ queryProductNoList: this.props.queryProductNoList });
    }
  }

  render() {
    const {
      inStockOrderNo,
      queryProductNoList,
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
                  Step 2 - 選擇進貨貨號
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
                    handlePrevStep={this.handlePrevStep}
                    handleNextStep={this.handleNextStep}
                    inStockOrderNo={inStockOrderNo}
                    queryProductNoList={queryProductNoList}
                    selectedProductNoList={selectedProductNoList}
                    handleCheckBoxSelected={this.handleCheckBoxSelected}
                  />
                </div>
              </TabPane>
              <TabPane eventKey={3}>
                <div className="container">
                  <EditBoard
                    handlePrevStep={this.handlePrevStep}
                    selectedProductNoList={selectedProductNoList}
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
  queryProductNoList: PropTypes.object.isRequired,
  batchCreateClothInfoes: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  queryProductNoList: state.productNoList
});

export default connect(
  mapStateToProps,
  { batchCreateClothInfoes }
)(BatchAddClothInfo);
