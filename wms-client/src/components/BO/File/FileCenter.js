import React, { Component } from "react";
import FlieContainer from "./FileContainer";
import {
  queryCategoryTodayFile,
  queryCategoryIntervalFiles
} from "../../../actions/FileActions";

class FileCenter extends Component {
  constructor() {
    super();
    this.state = {
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
  }

  handleCategoryCurrentQuery(fileCatagory) {
    queryCategoryTodayFile(fileCatagory)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            filenames: {
              ...this.state.filenames,
              [fileCatagory]: res.data
            }
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleCategoryPeriodQuery(fileCatagory, startDate, endDate) {
    queryCategoryIntervalFiles(fileCatagory, startDate, endDate)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            filenames: {
              ...this.state.filenames,
              [fileCatagory]: res.data
            }
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const { filenames } = this.state;
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
          <div className="row">
            <div className="col-6">
              <FlieContainer
                filenames={filenames.dailyComparison}
                containerTitle={dailyComparisonTitle}
                fileType={dailyComparisonFileType}
                handleCategoryCurrentQuery={this.handleCategoryCurrentQuery}
                handleCategoryPeriodQuery={this.handleCategoryPeriodQuery}
              />
            </div>
            <div className="col-6">
              <FlieContainer
                filenames={filenames.weeklyComparison}
                containerTitle={weeklyComparisonTitle}
                fileType={weeklyComparisonFileType}
                handleCategoryCurrentQuery={this.handleCategoryCurrentQuery}
                handleCategoryPeriodQuery={this.handleCategoryPeriodQuery}
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
              />
            </div>
            <div className="col-6">
              <FlieContainer
                filenames={filenames.adjustment}
                containerTitle={adjustmentTitle}
                fileType={adjustmentFileType}
                handleCategoryCurrentQuery={this.handleCategoryCurrentQuery}
                handleCategoryPeriodQuery={this.handleCategoryPeriodQuery}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FileCenter;
