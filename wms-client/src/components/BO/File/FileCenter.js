import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import FileContainer from "./FileContainer";
import FileContainerForCategory from "./FileContainerForCategory";
import {
  queryFileCategoryTodayFile,
  queryFileCategoryIntervalFiles,
  queryCategoryDetailList,
  downloadFile
} from "../../../actions/FileActions";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../Others/Spinner";

class FileCenter extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      filenames: {
        adjustment: [],
        allocation: [],
        dailyComparison: [],
        categoryDetail: []
      }
    };
    this.handleFileCategoryCurrentQuery = this.handleFileCategoryCurrentQuery.bind(
      this
    );
    this.handleFileCategoryPeriodQuery = this.handleFileCategoryPeriodQuery.bind(
      this
    );
    this.createCategoryDetailFilename = this.createCategoryDetailFilename.bind(
      this
    );
    this.handleDownloadClick = this.handleDownloadClick.bind(this);
  }

  handleFileCategoryCurrentQuery(fileCatagory) {
    this.setState({ isLoading: true }, () => {
      queryFileCategoryTodayFile(fileCatagory)
        .then(res => {
          if (res.status === 200) {
            this.setState({
              isLoading: false,
              filenames: {
                ...this.state.filenames,
                [fileCatagory]: [res.data]
              }
            });
          }
        })
        .catch(err => {
          this.setState({ isLoading: false });
        });
    });
  }

  handleFileCategoryPeriodQuery(fileCatagory, startDate, endDate) {
    this.setState({ isLoading: true }, () => {
      queryFileCategoryIntervalFiles(fileCatagory, startDate, endDate)
        .then(res => {
          if (res.status === 200) {
            this.setState({
              isLoading: false,
              filenames: {
                ...this.state.filenames,
                [fileCatagory]: res.data
              }
            });
          }
        })
        .catch(err => {
          this.setState({ isLoading: false });
        });
    });
  }

  createCategoryDetailFilename(selectedOptions) {
    const filenamePrefix = "CategoryDetail-";
    const fileType = ".xls";

    let result = [];

    selectedOptions.forEach(option => {
      result.push(filenamePrefix + option + fileType);
    });

    this.setState({
      filenames: { ...this.state.filenames, categoryDetail: result }
    });
  }

  handleDownloadClick(e) {
    downloadFile(e.target.name, e.target.value);
  }

  render() {
    const { isLoading, filenames } = this.state;
    const dailyComparisonTitle = "每日庫存比對紀錄";
    const allocationTitle = "每日倉庫調撥記錄";
    const adjustmentTitle = "每日存貨調整記錄";
    const dailyComparisonFileType = "dailyComparison";
    const allocationFileType = "allocation";
    const adjustmentFileType = "adjustment";
    const categoryDetailFileType = "categoryDetail";

    return (
      <div className="fileCenter">
        <div className="container">
          <p className="h4">檔案下載</p>
          <hr />
          <LoadingOverlay active={isLoading} spinner={<Spinner />}>
            <div style={{ height: "80vh" }}>
              <div className="row">
                <div className="col-6">
                  <FileContainer
                    filenames={filenames.allocation}
                    containerTitle={allocationTitle}
                    fileType={allocationFileType}
                    handleFileCategoryCurrentQuery={
                      this.handleFileCategoryCurrentQuery
                    }
                    handleFileCategoryPeriodQuery={
                      this.handleFileCategoryPeriodQuery
                    }
                    downloadFile={this.handleDownloadClick}
                  />
                </div>
                <div className="col-6">
                  <FileContainer
                    filenames={filenames.adjustment}
                    containerTitle={adjustmentTitle}
                    fileType={adjustmentFileType}
                    handleFileCategoryCurrentQuery={
                      this.handleFileCategoryCurrentQuery
                    }
                    handleFileCategoryPeriodQuery={
                      this.handleFileCategoryPeriodQuery
                    }
                    downloadFile={this.handleDownloadClick}
                  />
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-6">
                  <FileContainer
                    filenames={filenames.dailyComparison}
                    containerTitle={dailyComparisonTitle}
                    fileType={dailyComparisonFileType}
                    handleFileCategoryCurrentQuery={
                      this.handleFileCategoryCurrentQuery
                    }
                    handleFileCategoryPeriodQuery={
                      this.handleFileCategoryPeriodQuery
                    }
                    downloadFile={this.handleDownloadClick}
                  />
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-6">
                  <FileContainerForCategory
                    queryCategoryDetailList={this.props.queryCategoryDetailList}
                    createCategoryDetailFilename={
                      this.createCategoryDetailFilename
                    }
                    fileType={categoryDetailFileType}
                    categoryList={this.props.categoryList}
                    filenames={filenames.categoryDetail}
                    downloadFile={this.handleDownloadClick}
                  />
                </div>
              </div>
            </div>
          </LoadingOverlay>
        </div>
      </div>
    );
  }
}

FileCenter.propTypes = {
  categoryList: PropTypes.array,
  queryCategoryDetailList: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  categoryList: state.stockInfo.stockInfoes
});

export default connect(mapStateToProps, {
  queryCategoryDetailList
})(FileCenter);
