import React, { useState, useCallback, MouseEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { notifyRequestFailed } from "../../../utilities/notifyRequestFailed";
import FileContainer from "./FileContainer";
import FileContainerForCategory from "./FileContainerForCategory";
import {
  queryFileCategoryTodayFile,
  queryFileCategoryIntervalFiles,
  queryCategoryDetailList,
  downloadFile
} from "../../../actions/FileActions";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../Others/Spinner";
import { RootState, AppDispatch, SelectOption } from "../../../types";

type FileCategoryKey = "adjustment" | "allocation" | "dailyComparison" | "categoryDetail";

interface FilenamesState {
  adjustment: string[];
  allocation: string[];
  dailyComparison: string[];
  categoryDetail: string[];
}

const FileCenter: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filenames, setFilenames] = useState<FilenamesState>({
    adjustment: [],
    allocation: [],
    dailyComparison: [],
    categoryDetail: []
  });

  const dispatch = useDispatch<AppDispatch>();
  const categoryList = useSelector(
    (state: RootState) => state.stockInfo.stockInfoes
  ) as SelectOption[];

  const handleFileCategoryCurrentQuery = useCallback((fileCategory: string) => {
    setIsLoading(true);
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
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleFileCategoryPeriodQuery = useCallback(
    (fileCategory: string, startDate: string, endDate: string) => {
      setIsLoading(true);
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
        .finally(() => {
          setIsLoading(false);
        });
    },
    []
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
    const target = e.target as HTMLButtonElement;
    downloadFile(target.name, target.value);
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
        {/* Page Header - RWD */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            marginBottom: 'var(--spacing-3)',
          }}
        >
          <i
            className="fa fa-download"
            style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-xl)' }}
            aria-hidden="true"
          />
          <h4
            style={{
              margin: 0,
              color: 'var(--color-gray-800)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            檔案下載
          </h4>
        </div>
        <hr />
        <LoadingOverlay active={isLoading} spinner={<Spinner />}>
          <div style={{ minHeight: "80vh" }}>
            {/* First Row - RWD Grid */}
            <div className="row">
              <div className="col-12 col-md-6 mb-4">
                <FileContainer
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
