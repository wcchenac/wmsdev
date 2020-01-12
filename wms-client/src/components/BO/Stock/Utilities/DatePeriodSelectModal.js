import React, { Component } from "react";
import DatePicker from "react-datepicker";

class DatePeriodSelectModal extends Component {
  dateSettingAlgorithm(startDate, endDate, dayRange) {
    if (endDate < startDate) {
      return true;
    }

    if (endDate - startDate > 86400000 * dayRange) {
      return true;
    }

    return false;
  }

  classNameString() {
    let classNameString = "btn btn-info";

    switch (this.props.btnSize) {
      case "sm":
        classNameString = "btn btn-sm btn-info";
        break;
      case "lg":
        classNameString = "btn btn-lg btn-info";
        break;
      default:
        break;
    }

    return classNameString;
  }

  render() {
    let wrongDateSetting = this.dateSettingAlgorithm(
      this.props.startDate,
      this.props.endDate,
      this.props.dayRange
    );

    return (
      <React.Fragment>
        <button
          className={this.classNameString()}
          data-toggle="modal"
          data-target="#dateCondition"
        >
          {this.props.btnTitle}
        </button>
        <div
          className="modal fade"
          id="dateCondition"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="content"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">時間區間查詢</h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col">
                    <label>起始日期</label>
                    <DatePicker
                      name="start"
                      selected={this.props.startDate}
                      onChange={this.props.handleStartDateSelection}
                    />
                  </div>
                  <div className="col">
                    <label>結束日期</label>
                    <DatePicker
                      name="end"
                      selected={this.props.endDate}
                      onChange={this.props.handleEndDateSelection}
                    />
                  </div>
                </div>
                <small className="text-muted">
                  時間區間最長{this.props.dayRange}天
                </small>
                <br />
                {wrongDateSetting && (
                  <small className="text-danger">
                    日期設定錯誤，請修改日期
                  </small>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  取消
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  data-dismiss="modal"
                  disabled={wrongDateSetting}
                  onClick={this.props.handleDateSelectionModeClick}
                >
                  確認
                </button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default DatePeriodSelectModal;
