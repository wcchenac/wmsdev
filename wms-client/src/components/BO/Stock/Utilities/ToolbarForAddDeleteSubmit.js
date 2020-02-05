import React, { Component } from "react";

class ToolbarForAddDeleteSubmit extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-auto mr-auto">
            <button
              type="button"
              className="btn btn-primary mr-2"
              onClick={this.props.onAddClick}
            >
              新增資料
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.props.onDeleteClick}
              disabled={this.props.deleteDisabled}
            >
              刪除資料
            </button>
          </div>
          <div className="col-md-auto">
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={this.props.onSubmitClick}
              disabled={this.props.submitDisabled}
            >
              送出
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default ToolbarForAddDeleteSubmit;
