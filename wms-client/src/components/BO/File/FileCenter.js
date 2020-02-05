import React, { Component } from "react";
import FlieContainer from "./FileContainer";
import {
  queryCategoryTodayFile,
  queryCategoryIntervalFiles,
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
        weeklyComparison: {},
        adjustment: {},
        allocation: {},
        dailyComparison: {}
      }
    };
    this.handleCategoryCurrentQuery = this.handleCategoryCurrentQuery.bind(
      this
    );
    this.handleCategoryPeriodQuery = this.handleCategoryPeriodQuery.bind(this);
    this.handleDownloadClick = this.handleDownloadClick.bind(this);
  }

  handleCategoryCurrentQuery(fileCatagory) {
    this.setState({ isLoading: true }, () => {
      queryCategoryTodayFile(fileCatagory)
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
          console.log(err);
        });
    });
  }

  handleCategoryPeriodQuery(fileCatagory, startDate, endDate) {
    this.setState({ isLoading: true }, () => {
      queryCategoryIntervalFiles(fileCatagory, startDate, endDate)
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
          console.log(err);
        });
    });
  }

  handleDownloadClick(e) {
    downloadFile(e.target.name, e.target.value);
  }

  render() {
    const { isLoading, filenames } = this.state;
    const dailyComparisonTitle = "每日庫存比對紀錄";
    const weeklyComparisonTitle = "每週庫存比對紀錄";
    const allocationTitle = "每日倉庫調撥記錄";
    const adjustmentTitle = "每日存貨調整記錄";
    const dailyComparisonFileType = "dailyComparison";
    const weeklyComparisonFileType = "weeklyComparison";
    const allocationFileType = "allocation";
    const adjustmentFileType = "adjustment";

    return (
      <div className="fileCenter">
        <div className="container">
          <p className="h4">檔案下載</p>
          <hr />
          <LoadingOverlay active={isLoading} spinner={<Spinner />}>
            <div style={{ height: "80vh" }}>
              <div className="row">
                <div className="col-6">
                  <FlieContainer
                    filenames={filenames.dailyComparison}
                    containerTitle={dailyComparisonTitle}
                    fileType={dailyComparisonFileType}
                    handleCategoryCurrentQuery={this.handleCategoryCurrentQuery}
                    handleCategoryPeriodQuery={this.handleCategoryPeriodQuery}
                    downloadFile={this.handleDownloadClick}
                  />
                </div>
                <div className="col-6">
                  <FlieContainer
                    filenames={filenames.weeklyComparison}
                    containerTitle={weeklyComparisonTitle}
                    fileType={weeklyComparisonFileType}
                    handleCategoryCurrentQuery={this.handleCategoryCurrentQuery}
                    handleCategoryPeriodQuery={this.handleCategoryPeriodQuery}
                    downloadFile={this.handleDownloadClick}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-6">
                  <FlieContainer
                    filenames={filenames.allocation}
                    containerTitle={allocationTitle}
                    fileType={allocationFileType}
                    handleCategoryCurrentQuery={this.handleCategoryCurrentQuery}
                    handleCategoryPeriodQuery={this.handleCategoryPeriodQuery}
                    downloadFile={this.handleDownloadClick}
                  />
                </div>
                <div className="col-6">
                  <FlieContainer
                    filenames={filenames.adjustment}
                    containerTitle={adjustmentTitle}
                    fileType={adjustmentFileType}
                    handleCategoryCurrentQuery={this.handleCategoryCurrentQuery}
                    handleCategoryPeriodQuery={this.handleCategoryPeriodQuery}
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

export default FileCenter;
