import React, { Component } from "react";

class ToolbarForAddDeleteSubmit extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-auto">
            <button
              type="button"
              className="btn btn-primary mr-2"
              onClick={this.props.onAddClick}
            >
              新增一列
            </button>
            <button
              type="button"
              className="btn btn-primary mr-2"
              onClick={this.props.onDeleteClick}
              disabled={this.props.deleteDisabled}
            >
              刪除最後一列
            </button>
          </div>
          <div className="col-md-auto mr-auto">
            <form
              className="form-inline"
              onSubmit={this.props.handleRowNumSubmit}
            >
              <label className="form-label mr-2">新增複數列數</label>

              <input
                type="text"
                className="form-control col-3 mr-2"
                placeholder="輸入列數"
                name="assignRowNum"
                value={this.props.assignRowNum}
                onChange={this.props.handleRowNumChange}
              />
              <button className="btn btn-primary">新增</button>
            </form>
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
