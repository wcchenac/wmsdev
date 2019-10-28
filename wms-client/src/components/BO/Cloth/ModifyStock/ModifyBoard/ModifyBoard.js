import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getClothInfoes,
  clothIndentifierIsShiped,
  clothIdentifierWaitToShrinkIsTrue,
  createOutStockRequest
} from "../../../../../actions/ClothInfoAcions";
import ClothInfoContainer from "./ClothInfoContainer";
import OutStockBoard from "./OutStockBoard";
import { trackPromise } from "react-promise-tracker";

class ModifyBoard extends Component {
  constructor() {
    super();
    this.state = {
      isQuery: false,
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
    trackPromise(this.props.getClothInfoes(this.state.productNo));
    this.setState({ isQuery: true });
  }

  handleOutStockRequestSubmit(e, outStockRequest) {
    e.preventDefault();
    this.props.createOutStockRequest(outStockRequest);
  }

  componentDidUpdate(prevProps) {
    if (this.props.clothInfoes !== prevProps.clothInfoes) {
      this.setState({ clothInfoes: this.props.clothInfoes });
    }
  }

  render() {
    const { isQuery, productNo, clothInfoes } = this.state;

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
                disabled={
                  clothInfoes.length === 0 ||
                  productNo.toUpperCase() !==
                    clothInfoes[0].clothIdentifier.productNo
                }
                data-toggle="modal"
                data-target="#outStockRequest"
              >
                拉貨要求
              </button>
              {clothInfoes.length === 0 ? null : (
                <OutStockBoard
                  productNo={productNo}
                  handleOutStockRequestSubmit={this.handleOutStockRequestSubmit}
                />
              )}
            </div>
          </div>
          <hr />
          {isQuery ? (
            <ClothInfoContainer
              clothInfoes={clothInfoes}
              handleShip={this.props.clothIndentifierIsShiped}
              handleShrink={this.props.clothIdentifierWaitToShrinkIsTrue}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

ModifyBoard.propTypes = {
  clothInfoes: PropTypes.object.isRequired,
  getClothInfoes: PropTypes.func.isRequired,
  clothIndentifierIsShiped: PropTypes.func.isRequired,
  clothIdentifierWaitToShrinkIsTrue: PropTypes.func.isRequired,
  createOutStockRequest: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  clothInfoes: state.clothInfo.clothInfoes
});

export default connect(
  mapStateToProps,
  {
    getClothInfoes,
    clothIndentifierIsShiped,
    clothIdentifierWaitToShrinkIsTrue,
    createOutStockRequest
  }
)(ModifyBoard);
