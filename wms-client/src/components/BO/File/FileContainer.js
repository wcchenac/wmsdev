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

    console.log(startDate);
    console.log(endDate);
  }

  render() {
    const { startDate, endDate } = this.state;
    const { containerTitle, fileType, filenames } = this.props;
    const downloadURL =
      "http://localhost:8080/api/file/download/" + fileType + "/";

    return (
      <div>
        <div className="container">
          <div className="row">
            <div className="col">
              <p className="h5">{containerTitle}</p>
              <button
                type="button"
                className="btn btn-sm btn-info mr-1"
                onClick={this.onCurrentClick}
              >
                檔案查詢
              </button>
              <DatePeriodSelectModal
                btnTitle={"特定日期區間查詢"}
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
                  <th style={{ width: "70%" }}>檔名</th>
                  <th style={{ width: "30%" }}>下載連結</th>
                </tr>
              </thead>
              <tbody>
                {isEmpty(filenames) ? null : (
                  <tr>
                    {filenames.map((filename, index) => {
                      return (
                        <React.Fragment>
                          <td>{filename}</td>
                          <td>
                            <div className="row justify-content-center">
                              <a
                                key={index}
                                className="btn btn-primary"
                                href={downloadURL + filename}
                                download
                              >
                                <small>{filename}</small>
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
