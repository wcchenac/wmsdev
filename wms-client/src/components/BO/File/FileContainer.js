import React, { Component } from "react";
import DatePeriodSelectModal from "../Stock/Utilities/DatePeriodSelectModal";
import { isEmpty } from "../../../utilities/IsEmpty";
import { dayOfStart, dayOfEnd } from "../Stock/Utilities/DateUtils";

class FlieContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: dayOfStart(new Date()),
      endDate: dayOfEnd(new Date())
    };
    this.onCurrentClick = this.onCurrentClick.bind(this);
    this.handleStartDateSelection = this.handleStartDateSelection.bind(this);
    this.handleEndDateSelection = this.handleEndDateSelection.bind(this);
    this.handleDateSelectionModeClick = this.handleDateSelectionModeClick.bind(
      this
    );
  }

  onCurrentClick() {
    this.props.handleCategoryCurrentQuery(this.props.fileType);
  }

  handleStartDateSelection(date) {
    this.setState({ startDate: dayOfStart(date) });
  }

  handleEndDateSelection(date) {
    this.setState({ endDate: dayOfEnd(date) });
  }

  handleDateSelectionModeClick() {
    let startDate = this.state.startDate.toJSON().substring(0, 19);
    let endDate = this.state.endDate.toJSON().substring(0, 19);

    this.props.handleCategoryPeriodQuery(
      this.props.fileType,
      startDate,
      endDate
    );
  }

  render() {
    const { startDate, endDate } = this.state;
    const { containerTitle, fileType, filenames } = this.props;
    const downloadURL =
      "http://localhost:8080/api/file/download/" + fileType + "/";

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
                onClick={this.onCurrentClick}
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
                handleStartDateSelection={this.handleStartDateSelection}
                handleEndDateSelection={this.handleEndDateSelection}
                handleDateSelectionModeClick={this.handleDateSelectionModeClick}
                dayRange={7}
              />
            </div>
          </div>
          <hr />
          <div>
            <table className="table table-bordered table-hover">
              <thead className="thead-dark">
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
                {isEmpty(filenames) ? null : (
                  <tr>
                    {filenames.map((filename, index) => {
                      return (
                        <React.Fragment key={index}>
                          <td style={{ padding: "0.5em 1em" }}>
                            <button className="btn-customize" disabled>
                              {filename}
                            </button>
                          </td>
                          <td style={{ padding: "0.5em 1em" }}>
                            <div className="d-flex justify-content-center">
                              <a
                                className="btn btn-primary"
                                href={downloadURL + filename}
                                download
                              >
                                下載
                              </a>
                            </div>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default FlieContainer;
