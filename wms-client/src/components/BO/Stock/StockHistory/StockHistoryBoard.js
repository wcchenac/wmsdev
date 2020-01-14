import React, { Component } from "react";
import PropTypes from "prop-types";
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

class StockHistoryBoard extends Component {
  constructor() {
    super();
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

  treeDataTranslation(treeData) {
    if (treeData === undefined) {
      return [];
    }

    let resultArray = [];

    treeData.forEach(object => {
      resultArray.push(this.transversalForTreeData(object));
    });

    return resultArray;
  }

  transversalForTreeData(raw) {
    if (raw.nodes.length === 0) {
      return {
        title: <TreeDataNode stockIdentifier={raw.stockIdentifier} />,
        children: []
      };
    }

    let children = [];

    raw.nodes.forEach(object => {
      children.push(this.transversalForTreeData(object));
    });

    return {
      title: <TreeDataNode stockIdentifier={raw.stockIdentifier} />,
      children: children
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.treeData.stockInfoes !== prevProps.treeData.stockInfoes) {
      this.setState({
        treeData: this.treeDataTranslation(this.props.treeData.stockInfoes)
      });
    }
  }

  handleProductNoChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleStartDateSelection(date) {
    this.setState({ startDate: dayOfStart(date) });
  }

  handleEndDateSelection(date) {
    this.setState({ endDate: dayOfEnd(date) });
  }

  handleQuerySubmit(e) {
    e.preventDefault();
    const { productNo, startDate, endDate } = this.state;

    let request = {
      productNo: productNo,
      startDate: startDate.toJSON().substring(0, 19),
      endDate: endDate.toJSON().substring(0, 19)
    };

    this.setState({ isLoading: true }, () => {
      this.props.getProductHistory(request).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  contentAlgorithm(isQuery, treeData) {
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
          <div style={{ height: 600 }}>
            <SortableTree
              treeData={treeData}
              rowHeight={75}
              onChange={treeData => this.setState({ treeData })}
              canDrag={false}
            />
          </div>
        );
      }
    }
  }

  render() {
    const { isLoading, isQuery, treeData, startDate, endDate } = this.state;

    return (
      <div className="stockHistoryBoard">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
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
                dayRange={180}
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
            <div style={{ height: "80vh" }}>
              {this.contentAlgorithm(isQuery, treeData)}
            </div>
          </LoadingOverlay>
        </div>
      </div>
    );
  }
}

StockHistoryBoard.propTypes = {
  treeData: PropTypes.object.isRequired,
  getProductHistory: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  treeData: state.stockInfo
});

export default connect(mapStateToProps, { getProductHistory })(
  StockHistoryBoard
);
