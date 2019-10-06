import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getClothInfoes,
  clothIndentifierIsShiped,
  clothIdentifierWaitToShrinkIsTrue
} from "../../../../../actions/ClothInfoAcions";
import ClothInfoContainer from "./ClothInfoContainer";
import OutStockBoard from "./OutStockBoard";

class ModifyBoard extends Component {
  constructor() {
    super();
    this.state = {
      productNo: "",
      clothInfoes: []
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleOutStockRequestSubmit = this.handleOutStockRequestSubmit.bind(
      this
    );
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.getClothInfoes(this.state.productNo);
  }

  handleOutStockRequestSubmit(e, outStockRequest) {
    e.preventDefault();
    // save outStockRequest to db
    console.log(outStockRequest);
  }

  componentDidUpdate(prevProps) {
    if (this.props.clothInfo.clothInfoes !== prevProps.clothInfo.clothInfoes) {
      this.setState({ clothInfoes: this.props.clothInfo.clothInfoes });
    }
  }

  render() {
    const { productNo, clothInfoes } = this.state;

    return (
      <div className="modify_clothInfo">
        <div className="container">
          <div className="row">
            <div className="col-md-10 mr-auto">
              <form onSubmit={this.onSubmit}>
                <div className="form-group row">
                  <label className="col-md-auto col-form-label text-center">
                    貨號查詢
                  </label>
                  <div className="col-md-5">
                    <input
                      type="text"
                      name="productNo"
                      placeholder="請輸入貨號"
                      className="form-control"
                      value={this.state.productNo}
                      onChange={this.onChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    查詢
                  </button>
                </div>
              </form>
            </div>
            <div className="col-md-auto">
              <button
                className="btn btn-primary"
                disabled={clothInfoes.length === 0}
                data-toggle="modal"
                data-target="#outStockRequest"
              >
                拉貨要求
              </button>
              <div
                className="modal fade"
                id="outStockRequest"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="content"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-lg" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">拉貨要求</h5>
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
                      {clothInfoes.length === 0 ? null : (
                        <OutStockBoard
                          productNo={productNo}
                          handleOutStockRequestSubmit={
                            this.handleOutStockRequestSubmit
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <ClothInfoContainer
            clothInfoes={clothInfoes}
            handleShip={this.props.clothIndentifierIsShiped}
            handleShrink={this.props.clothIdentifierWaitToShrinkIsTrue}
          />
        </div>
      </div>
    );
  }
}

ModifyBoard.propTypes = {
  clothInfo: PropTypes.object.isRequired,
  getClothInfoes: PropTypes.func.isRequired,
  clothIndentifierIsShiped: PropTypes.func.isRequired,
  clothIdentifierWaitToShrinkIsTrue: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  clothInfo: state.clothInfo
});

export default connect(
  mapStateToProps,
  {
    getClothInfoes,
    clothIndentifierIsShiped,
    clothIdentifierWaitToShrinkIsTrue
  }
)(ModifyBoard);
