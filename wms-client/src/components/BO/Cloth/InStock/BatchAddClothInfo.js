import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Nav, TabContainer, TabContent, TabPane } from "react-bootstrap";
import QueryOrder from "./QueryOrder";
import SelectionBoard from "./SelectionBoard";
import EditBoard from "./EditBoard";

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
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleCheckBoxSelected = this.handleCheckBoxSelected.bind(this);
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
      selectedList.push({ productNo: element, selected: false, index: index });
    });

    this.setState({ selectedProductNoList: selectedList });
  }

  handleFormSubmit(e) {
    e.preventDefault();
    //receive order content (productNolist) and store at props
    this.setState(
      { queryProductNoList: ["123", "234", "345", "456"] },
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
                    handleFormSubmit={this.handleFormSubmit}
                  />
                </div>
              </TabPane>
              <TabPane eventKey={2}>
                <div className="container">
                  <div className="row justify-content-between">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={this.handlePrevStep}
                    >
                      上一步
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={this.handleNextStep}
                    >
                      下一步
                    </button>
                  </div>
                  <SelectionBoard
                    inStockOrderNo={inStockOrderNo}
                    queryProductNoList={queryProductNoList}
                    handleCheckBoxSelected={this.handleCheckBoxSelected}
                  />
                </div>
              </TabPane>
              <TabPane eventKey={3}>
                <div className="container">
                  <div className="row justify-content-between">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={this.handlePrevStep}
                    >
                      上一步
                    </button>
                  </div>
                  <br />
                  <EditBoard selectedProductNoList={selectedProductNoList} />
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
  queryProductNoList: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  queryProductNoList: state.productNoList
});

export default connect(
  mapStateToProps,
  null
)(BatchAddClothInfo);
