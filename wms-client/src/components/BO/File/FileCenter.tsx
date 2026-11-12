import React, { Component } from "react";
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

import type { RootState } from "../../../types/state";
import type { CategoryChoice } from "../User/AdminPlatform/StockCategory";

type FileCategory = "adjustment" | "allocation" | "dailyComparison" | "categoryDetail";

interface FilenameMap {
  adjustment: string[];
  allocation: string[];
  dailyComparison: string[];
  categoryDetail: string[];
}

interface StateProps {
  categoryList: CategoryChoice[];
}

interface DispatchProps {
  queryCategoryDetailList: () => void;
}

type Props = StateProps & DispatchProps;

interface State {
  isLoading: boolean;
  filenames: FilenameMap;
}


class FileCenter extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
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

  handleFileCategoryCurrentQuery(fileCatagory: string) {
    this.setState({ isLoading: true }, () => {
      queryFileCategoryTodayFile(fileCatagory)
        .then(res => {
          if (res?.status === 200) {
            this.setState({
              isLoading: false,
              filenames: {
                ...this.state.filenames,
                [fileCatagory as FileCategory]: [String(res.data)]
              }
            });
          }
        })
        .catch(err => {
          this.setState({ isLoading: false });
        });
    });
  }

  handleFileCategoryPeriodQuery(fileCatagory: string, startDate: string, endDate: string) {
    this.setState({ isLoading: true }, () => {
      queryFileCategoryIntervalFiles(fileCatagory, startDate, endDate)
        .then(res => {
          if (res?.status === 200) {
            this.setState({
              isLoading: false,
              filenames: {
                ...this.state.filenames,
                [fileCatagory as FileCategory]: res.data as string[]
              }
            });
          }
        })
        .catch(err => {
          this.setState({ isLoading: false });
        });
    });
  }

  createCategoryDetailFilename(selectedOptions: string[]) {
    const filenamePrefix = "CategoryDetail-";
    const fileType = ".xls";

    const result: string[] = [];

    selectedOptions.forEach(option => {
      result.push(filenamePrefix + option + fileType);
    });

    this.setState({
      filenames: { ...this.state.filenames, categoryDetail: result }
    });
  }

  handleDownloadClick(e: React.MouseEvent<HTMLButtonElement>) {
    downloadFile(e.currentTarget.name, e.currentTarget.value);
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


const mapStateToProps = (state: RootState): StateProps => ({
  categoryList: state.stockInfo.stockInfoes as unknown as CategoryChoice[]
});

export default connect(mapStateToProps, {
  queryCategoryDetailList
})(FileCenter);
