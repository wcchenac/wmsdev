import React, { Component } from "react";
import { connect } from "react-redux";
import { getProductHistory } from "../../../../actions/StockAcions";
import { dayOfStart, dayOfEnd, setPreviousMonth } from "../Utilities/DateUtils";
import QueryProductInformation from "../Utilities/QueryProductInformation";
import DatePeriodSelectModal from "../Utilities/DatePeriodSelectModal";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import "react-sortable-tree/style.css";
import SortableTree from "react-sortable-tree";
import TreeDataNode from "./TreeDataNode";

import type { RootState } from "../../../../types/state";
import type { ApiStatus, StoredStockInfo } from "../../../../types/domain";
import type { TreeItem } from "react-sortable-tree";

interface HistorySourceNode {
  stockInfo: StoredStockInfo;
  nodes: HistorySourceNode[];
}

interface StateProps {
  treeData: { stockInfoes: HistorySourceNode[] };
}

interface DispatchProps {
  getProductHistory: (request: {
    productNo: string;
    startDate: string;
    endDate: string;
  }) => Promise<ApiStatus | undefined>;
}

type Props = StateProps & DispatchProps;

interface State {
  isLoading: boolean;
  isQuery: boolean;
  productNo: string;
  startDate: Date;
  endDate: Date;
  treeData: TreeItem[];
}


const dayRangeSetting = 180;

class StockHistoryBoard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      isQuery: false,
      productNo: "",
      startDate: setPreviousMonth(dayOfStart(new Date()), 1),
      endDate: dayOfEnd(new Date()),
      treeData: []
    };
    this.handleProductNoChange = this.handleProductNoChange.bind(this);
    this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
    this.handleStartDateSelection = this.handleStartDateSelection.bind(this);
    this.handleEndDateSelection = this.handleEndDateSelection.bind(this);
  }

  treeDataTranslation(treeData: HistorySourceNode[] | undefined): TreeItem[] {
    if (treeData === undefined) {
      return [];
    }

    const resultArray: TreeItem[] = [];

    treeData.forEach(object => {
      resultArray.push(this.transversalForTreeData(object));
    });

    return resultArray;
  }

  transversalForTreeData(raw: HistorySourceNode): TreeItem {
    // if (raw.nodes.length === 0) {
    //   return {
    //     title: <TreeDataNode stockIdentifier={raw.stockIdentifier} />,
    //     children: []
    //   };
    // }

    // const children: TreeItem[] = [];

    // raw.nodes.forEach(object => {
    //   children.push(this.transversalForTreeData(object));
    // });

    // return {
    //   title: <TreeDataNode stockIdentifier={raw.stockIdentifier} />,
    //   children: children
    // };
    if (raw.nodes.length === 0) {
      return {
        title: <TreeDataNode stockInfo={raw.stockInfo} />,
        children: []
      };
    }

    const children: TreeItem[] = [];

    raw.nodes.forEach(object => {
      children.push(this.transversalForTreeData(object));
    });

    return {
      title: <TreeDataNode stockInfo={raw.stockInfo} />,
      children: children
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.treeData.stockInfoes !== prevProps.treeData.stockInfoes) {
      this.setState({
        treeData: this.treeDataTranslation(this.props.treeData.stockInfoes)
      });
    }
  }

  handleProductNoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.name === "productNo") {
      this.setState({ productNo: e.target.value });
    }
  }

  handleStartDateSelection(date: Date | null) {
    this.setState({ startDate: dayOfStart(date as Date) });
  }

  handleEndDateSelection(date: Date | null) {
    this.setState({ endDate: dayOfEnd(date as Date) });
  }

  handleQuerySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { productNo, startDate, endDate } = this.state;

    let request = {
      productNo: productNo,
      startDate: startDate.toJSON().substring(0, 19),
      endDate: endDate.toJSON().substring(0, 19)
    };

    this.setState({ isLoading: true }, () => {
      this.props.getProductHistory(request).then(response => {
        if (response?.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  contentAlgorithm() {
    const { isQuery, treeData } = this.state;

    if (!isQuery) {
      return null;
    } else {
      if (treeData.length === 0) {
        return (
          <div className="row justify-content-md-center">
            <div className="col-md-6">
              <div className="alert alert-warning" role="alert">
                <p className="h5 text-center mb-0">
                  查無此貨號資料 或 此貨號設定期間內無進貨資料
                </p>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div style={{ height: "70vh" }}>
            <SortableTree
              treeData={treeData}
              rowHeight={130}
              onChange={(nextTree) => this.setState({ treeData: nextTree })}
              canDrag={false}
            />
          </div>
        );
      }
    }
  }

  render() {
    const { isLoading, startDate, endDate } = this.state;

    return (
      <div className="stockHistoryBoard">
        <div className="container">
          <div className="row">
            <div className="col-md-auto">
              <QueryProductInformation
                value={this.state.productNo}
                onChange={this.handleProductNoChange}
                onSubmit={this.handleQuerySubmit}
              />
            </div>
            <div className="col-md-auto">
              <DatePeriodSelectModal
                btnTitle={"設定時間區間"}
                startDate={startDate}
                endDate={endDate}
                handleStartDateSelection={this.handleStartDateSelection}
                handleEndDateSelection={this.handleEndDateSelection}
                dayRange={dayRangeSetting}
              />
            </div>
            <div className="col-md-auto">
              <button className="btn-customize" disabled>
                <small className="text-muted">若無設定，預設查詢前一個月</small>
              </button>
            </div>
          </div>
          <hr />
          <LoadingOverlay active={isLoading} spinner={<Spinner />}>
            <div className="scrollbar-70" style={{ height: "75vh" }}>
              {this.contentAlgorithm()}
            </div>
          </LoadingOverlay>
        </div>
      </div>
    );
  }
}


const mapStateToProps = (state: RootState): StateProps => ({
  treeData: state.stockInfo as unknown as StateProps["treeData"]
});

export default connect(mapStateToProps, { getProductHistory })(
  StockHistoryBoard
);
