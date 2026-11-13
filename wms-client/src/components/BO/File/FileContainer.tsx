import React, { useState, useCallback, MouseEvent } from "react";
import DatePeriodSelectModal from "../Stock/Utilities/DatePeriodSelectModal";
import { dayOfStart, dayOfEnd } from "../Stock/Utilities/DateUtils";

const NotFoundMessage = "File Not Found";

interface FileContainerProps {
  containerTitle: string;
  fileType: string;
  filenames: string[];
  handleFileCategoryCurrentQuery: (fileType: string) => void;
  handleFileCategoryPeriodQuery: (
    fileType: string,
    startDate: string,
    endDate: string
  ) => void;
  downloadFile: (e: MouseEvent<HTMLButtonElement>) => void;
}

const FileContainer: React.FC<FileContainerProps> = ({
  containerTitle,
  fileType,
  filenames,
  handleFileCategoryCurrentQuery,
  handleFileCategoryPeriodQuery,
  downloadFile
}) => {
  const [startDate, setStartDate] = useState<Date>(() => dayOfStart(new Date()));
  const [endDate, setEndDate] = useState<Date>(() => dayOfEnd(new Date()));

  const onCurrentClick = useCallback(() => {
    handleFileCategoryCurrentQuery(fileType);
  }, [handleFileCategoryCurrentQuery, fileType]);

  const handleStartDateSelection = useCallback((date: Date) => {
    setStartDate(dayOfStart(date));
  }, []);

  const handleEndDateSelection = useCallback((date: Date) => {
    setEndDate(dayOfEnd(date));
  }, []);

  const handleDateSelectionModeClick = useCallback(() => {
    const startDateStr = startDate.toJSON().substring(0, 19);
    const endDateStr = endDate.toJSON().substring(0, 19);

    handleFileCategoryPeriodQuery(fileType, startDateStr, endDateStr);
  }, [startDate, endDate, handleFileCategoryPeriodQuery, fileType]);

  return (
    <div
      style={{
        border: "2px solid black",
        borderRadius: "5px",
        padding: "0.5rem 0rem",
        margin: "1rem 0rem"
      }}
    >
      <div className="container">
        <div className="row pt-1">
          <div className="col-auto">
            <p className="h5 mb-0" style={{ padding: "4px 0px" }}>
              {containerTitle}
            </p>
          </div>
          <div className="col-auto">
            <button
              type="button"
              className="btn btn-sm btn-info"
              onClick={onCurrentClick}
            >
              檔案查詢
            </button>
          </div>
          <div className="col-auto">
            <DatePeriodSelectModal
              btnTitle={"特定日期區間查詢"}
              fileType={fileType}
              btnSize={"sm"}
              startDate={startDate}
              endDate={endDate}
              handleStartDateSelection={handleStartDateSelection}
              handleEndDateSelection={handleEndDateSelection}
              handleDateSelectionModeClick={handleDateSelectionModeClick}
              dayRange={7}
            />
          </div>
        </div>
        <hr />
        <div>
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th style={{ width: "80%", padding: "0.5em 1.5em" }}>檔名</th>
                <th
                  style={{
                    width: "20%",
                    padding: "7px 0px",
                    textAlign: "center"
                  }}
                />
              </tr>
            </thead>
            <tbody>
              {filenames.length === 0
                ? null
                : filenames.map((filename, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        <td style={{ padding: "0.5em 1em" }}>
                          <button className="btn-customize" disabled>
                            {filename}
                          </button>
                        </td>
                        <td style={{ padding: "0.5em 1em" }}>
                          {filename === NotFoundMessage ? null : (
                            <div className="d-flex justify-content-center">
                              <button
                                className="btn btn-primary"
                                name={fileType}
                                value={filename}
                                onClick={downloadFile}
                              >
                                下載
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FileContainer;
