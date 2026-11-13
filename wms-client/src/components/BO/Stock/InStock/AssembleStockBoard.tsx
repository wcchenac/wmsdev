import React, { Component } from "react";
import { connect } from "react-redux";
import { Nav, TabContainer, TabContent, TabPane } from "react-bootstrap";
import QueryOrder from "./Common/QueryOrder";
import SelectionBoard from "./Common/SelectionBoard";
import EditBoard from "./Common/EditBoard";
import {
  getAssembleOrder,
  batchCreateStockInfoes,
} from "../../../../actions/StockAcions";
import {
  checkWaitHandleStatusCompletion,
  checkWaitHandleProductStatus,
} from "../Utilities/ValidateQueryOrderResponse";
import { isEmpty } from "../../../../utilities/IsEmpty";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import type { RootState, ErrorState } from "../../../../types/state";
import type {
  ApiStatus,
  InStockRequestPayload,
  SelectedProduct,
  StatusByProduct,
} from "../../../../types/domain";
import type { InStockEditorRow } from "./Common/StockInfo";

interface OrderSlice {
  stockInfoes: {
    currentStatus?: StatusByProduct;
    waitHandleStatus?: StatusByProduct;
  };
}

interface StateProps {
  queryAssembleOrderResult: OrderSlice;
  errors: ErrorState;
}

interface DispatchProps {
  getAssembleOrder: (orderNo: string) => Promise<ApiStatus | undefined>;
  batchCreateStockInfoes: (
    requests: InStockRequestPayload[]
  ) => Promise<ApiStatus | undefined>;
}

type Props = StateProps & DispatchProps;

interface State {
  isLoading: boolean;
  orderNo: string;
  isOrderValid: boolean | undefined;
  key: number | string | null;
  currentOrderStatus: StatusByProduct;
  waitHandleStatus: StatusByProduct;
  selectedProductNoList: SelectedProduct[];
}

interface AssembleStockBoard {
  timer?: ReturnType<typeof setTimeout> | null;
}

class AssembleStockBoard extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
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
    this.handleInStockRequestSubmit = this.handleInStockRequestSubmit.bind(this);
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

  initialSelectedList(
    currentOrderStatus: StatusByProduct,
    waitHandleStatus: StatusByProduct
  ) {
    if (!isEmpty(currentOrderStatus)) {
      const selectedList: SelectedProduct[] = [];

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

  handleTabSelect(key: number | string | null) {
    this.setState({ key });
  }

  handlePrevStep() {
    this.setState({
      key: Number(this.state.key) - 1,
    });
  }

  handleNextStep() {
    this.setState({
      key: Number(this.state.key) + 1,
    });
  }

  handleOrderNo(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.name === "orderNo") {
      this.setState({ orderNo: e.target.value });
    }
  }

  handleQueryOrderSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    this.setState({ isLoading: true }, () => {
      this.props.getAssembleOrder(this.state.orderNo).then((response) => {
        if (response?.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  handleCheckBoxSelected(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
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

  handleSelectionClick(e: React.MouseEvent<HTMLButtonElement>) {
    const copyList = [...this.state.selectedProductNoList];
    const value = (e.target as HTMLButtonElement).value === "true";

    copyList.forEach((object) => {
      object.selected = value;
    });

    this.setState({
      selectedProductNoList: copyList,
    });
  }

  handleInStockRequestSubmit(
    e: React.MouseEvent<HTMLButtonElement>,
    index: number,
    inStockRequests: InStockEditorRow[]
  ) {
    e.preventDefault();
    const copyList = [...this.state.selectedProductNoList];

    this.setState({ isLoading: true }, () => {
      this.props
        .batchCreateStockInfoes(inStockRequests as InStockRequestPayload[])
        .then((res) => {
          if (res?.status === 200) {
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

  componentDidUpdate(prevProps: Props) {
    if (this.props.queryAssembleOrderResult !== prevProps.queryAssembleOrderResult) {
      this.setState(
        {
          currentOrderStatus: this.props.queryAssembleOrderResult.stockInfoes
            .currentStatus as StatusByProduct,
          waitHandleStatus: this.props.queryAssembleOrderResult.stockInfoes
            .waitHandleStatus as StatusByProduct,
        },
        function (this: AssembleStockBoard) {
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
      <div className="batch_add_stockInfo">
        <div className="container">
          <TabContainer
            id="left-tabs"
            activeKey={key as string | number}
            onSelect={(selected) => this.handleTabSelect(selected)}
          >
            <Nav justify variant="pills">
              <Nav.Item>
                <Nav.Link eventKey={1} disabled={key !== 1}>
                  Step 1 - 查詢組裝單內容
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
                        type="組裝單"
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
                    type="組裝單"
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
                    type="assemble"
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

const mapStateToProps = (state: RootState): StateProps => ({
  queryAssembleOrderResult: state.stockInfo as OrderSlice,
  errors: state.errors,
});

export default connect(mapStateToProps, {
  getAssembleOrder,
  batchCreateStockInfoes,
})(AssembleStockBoard);
