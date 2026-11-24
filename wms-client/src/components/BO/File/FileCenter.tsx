import React, { useState, useCallback, useMemo, MouseEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { notifyRequestFailed } from "../../../utilities/notifyRequestFailed";
import { useSubmitLock } from "../../../utilities/useSubmitLock";
import { isSelectOption } from "../../../utilities/selectOption";
import FileContainer from "./FileContainer";
import FileContainerForCategory from "./FileContainerForCategory";
import {
  queryFileCategoryTodayFile,
  queryFileCategoryIntervalFiles,
  queryCategoryDetailList,
  downloadFile
} from "../../../actions/FileActions";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { Spinner } from "../../Others/Spinner";
import { PageHeader } from "../../UI";
import { RootState, AppDispatch } from "../../../types";

type FileCategoryKey = "adjustment" | "allocation" | "dailyComparison" | "categoryDetail";

interface FilenamesState {
  adjustment: string[];
  allocation: string[];
  dailyComparison: string[];
  categoryDetail: string[];
}

const FileCenter: React.FC = () => {
  const { isLocked: isLoading, runLocked } = useSubmitLock();
  const [filenames, setFilenames] = useState<FilenamesState>({
    adjustment: [],
    allocation: [],
    dailyComparison: [],
    categoryDetail: []
  });

  const dispatch = useDispatch<AppDispatch>();
  const rawCategories: unknown = useSelector(
    (state: RootState) => state.stockInfo.categories
  );
  const categoryList = useMemo(
    () => (Array.isArray(rawCategories) ? rawCategories.filter(isSelectOption) : []),
    [rawCategories]
  );

  const handleFileCategoryCurrentQuery = useCallback((fileCategory: string) => {
    void runLocked(() =>
      queryFileCategoryTodayFile(fileCategory)
        .then((res) => {
          if (res.status === 200) {
            setFilenames((prev) => ({
              ...prev,
              [fileCategory as FileCategoryKey]: [res.data]
            }));
          }
        })
        .catch(notifyRequestFailed)
    );
  }, [runLocked]);

  const handleFileCategoryPeriodQuery = useCallback(
    (fileCategory: string, startDate: string, endDate: string) => {
      void runLocked(() =>
        queryFileCategoryIntervalFiles(fileCategory, startDate, endDate)
          .then((res) => {
            if (res.status === 200) {
              setFilenames((prev) => ({
                ...prev,
                [fileCategory as FileCategoryKey]: res.data
              }));
            }
          })
          .catch(notifyRequestFailed)
      );
    },
    [runLocked]
  );

  const createCategoryDetailFilename = useCallback((selectedOptions: string[]) => {
    const filenamePrefix = "CategoryDetail-";
    const fileType = ".xls";

    const result = selectedOptions.map(
      (option) => filenamePrefix + option + fileType
    );

    setFilenames((prev) => ({
      ...prev,
      categoryDetail: result
    }));
  }, []);

  const handleDownloadClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    void downloadFile(target.name, target.value);
  }, []);

  const handleQueryCategoryDetailList = useCallback(() => {
    dispatch(queryCategoryDetailList()).catch(notifyRequestFailed);
  }, [dispatch]);

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
        <PageHeader
          title={
            <>
              <i className="fa fa-download me-2 text-primary" aria-hidden="true" />
              檔案下載
            </>
          }
        />
        <LoadingOverlay active={isLoading} spinner={<Spinner />}>
          <div style={{ minHeight: "80vh" }}>
            {/* First Row - RWD Grid */}
            <div className="row">
              <div className="col-12 col-md-6 mb-4">
                <FileContainer
                  isLoading={isLoading}
                  filenames={filenames.allocation}
                  containerTitle={allocationTitle}
                  fileType={allocationFileType}
                  handleFileCategoryCurrentQuery={
                    handleFileCategoryCurrentQuery
                  }
                  handleFileCategoryPeriodQuery={handleFileCategoryPeriodQuery}
                  downloadFile={handleDownloadClick}
                />
              </div>
              <div className="col-12 col-md-6 mb-4">
                <FileContainer
                  isLoading={isLoading}
                  filenames={filenames.adjustment}
                  containerTitle={adjustmentTitle}
                  fileType={adjustmentFileType}
                  handleFileCategoryCurrentQuery={
                    handleFileCategoryCurrentQuery
                  }
                  handleFileCategoryPeriodQuery={handleFileCategoryPeriodQuery}
                  downloadFile={handleDownloadClick}
                />
              </div>
            </div>
            <hr />
            {/* Second Row - RWD Grid */}
            <div className="row">
              <div className="col-12 col-md-6 mb-4">
                <FileContainer
                  isLoading={isLoading}
                  filenames={filenames.dailyComparison}
                  containerTitle={dailyComparisonTitle}
                  fileType={dailyComparisonFileType}
                  handleFileCategoryCurrentQuery={
                    handleFileCategoryCurrentQuery
                  }
                  handleFileCategoryPeriodQuery={handleFileCategoryPeriodQuery}
                  downloadFile={handleDownloadClick}
                />
              </div>
            </div>
            <hr />
            {/* Third Row - RWD Grid */}
            <div className="row">
              <div className="col-12 col-md-6 mb-4">
                <FileContainerForCategory
                  isLoading={isLoading}
                  queryCategoryDetailList={handleQueryCategoryDetailList}
                  createCategoryDetailFilename={createCategoryDetailFilename}
                  fileType={categoryDetailFileType}
                  categoryList={categoryList}
                  filenames={filenames.categoryDetail}
                  downloadFile={handleDownloadClick}
                />
              </div>
            </div>
          </div>
        </LoadingOverlay>
      </div>
    </div>
  );
};

export default FileCenter;
