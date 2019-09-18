import React, { Component } from "react";
import { Link } from "react-router-dom";

class ClothInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      outStockReason: ""
    };
    this.onClick = this.onClick.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onClick() {
    const shipRequest = {
      clothIdentifierId: this.props.clothInfo.clothIdentifier.id,
      reason: this.state.outStockReason
    };
    this.props.handleShip(shipRequest);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    const { clothInfo } = this.props;
    const { clothIdentifier } = this.props.clothInfo;

    return (
      <tr>
        <th scope="col">{clothIdentifier.productNo}</th>
        <th scope="col">{clothIdentifier.lotNo}</th>
        <th scope="col">{clothIdentifier.type}</th>
        <th scope="col">{clothIdentifier.length}</th>
        <th scope="col">{clothIdentifier.unit}</th>
        <th scope="col">{clothIdentifier.serialNo}</th>
        <th scope="col">{clothInfo.color}</th>
        <th scope="col">{clothInfo.defect}</th>
        <th scope="col">
          <div
            className="btn-toolbar"
            role="toolbar"
            aria-label="Toolbar with button groups"
          >
            <div
              className="btn-group mr-2"
              role="group"
              aria-label="First group"
            >
              <Link
                to={{
                  pathname: `/cloth/3/${clothInfo.id}`,
                  state: { clothInfo: this.props.clothInfo }
                }}
                className="btn btn-primary"
                role="button"
              >
                查看/修改
              </Link>
            </div>
            <div className="btn-group" role="group" aria-label="Second group">
              <button
                type="button"
                className="btn btn-primary"
                data-toggle="modal"
                data-target="#reasonContent"
              >
                出庫
              </button>
              <div
                className="modal fade"
                id="reasonContent"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="content"
                aria-hidden="true"
              >
                <div
                  className="modal-dialog modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="content">
                        出庫確認
                      </h5>
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
                      <form>
                        <div className="form-group row">
                          <label className="col-3 col-form-label text-center">
                            出庫原因
                          </label>
                          <div className="col">
                            <input
                              type="text"
                              name="outStockReason"
                              placeholder="請輸入出庫原因"
                              className="form-control"
                              value={this.state.outStockReason}
                              onChange={this.onChange}
                            />
                          </div>
                        </div>
                      </form>
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
                        onClick={this.onClick}
                        disabled={!this.state.outStockReason}
                      >
                        確認
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </th>
      </tr>
    );
  }
}

export default ClothInfo;
