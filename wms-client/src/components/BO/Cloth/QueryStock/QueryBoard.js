import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getClothInfoes } from "../../../../actions/ClothInfoAcions";
import ClothInfoContainer from "./ClothInfoContainer";
import { trackPromise } from "react-promise-tracker";

class QueryBoard extends Component {
  constructor() {
    super();
    this.state = {
      isQuery: false,
      productNo: "",
      clothInfoes: []
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();
    trackPromise(this.props.getClothInfoes(this.state.productNo));
    this.setState({ isQuery: true });
  }

  componentDidUpdate(prevProps) {
    if (this.props.clothInfo.clothInfoes !== prevProps.clothInfo.clothInfoes) {
      this.setState({ clothInfoes: this.props.clothInfo.clothInfoes });
    }
  }

  sumTotalLength(clothInfoes) {
    let roll = 0;
    let board = 0;
    for (let i = 0; i < clothInfoes.length; i += 1) {
      let clothIdentifier = clothInfoes[i].clothIdentifier;
      if (clothIdentifier.type === "整支") {
        roll += parseFloat(clothIdentifier.length);
      }
      if (clothIdentifier.type === "板卷") {
        board += parseFloat(clothIdentifier.length);
      }
    }
    return { rollLength: roll, boardLength: board };
  }

  render() {
    const { isQuery, productNo, clothInfoes } = this.state;
    const { rollLength, boardLength } = this.sumTotalLength(clothInfoes);

    return (
      <div className="query_clothInfo">
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
                className="btn btn-info"
                disabled={
                  clothInfoes.length === 0 ||
                  productNo !== clothInfoes[0].clothIdentifier.productNo
                }
                data-toggle="modal"
                data-target="#picture"
              >
                產品圖片
              </button>
              <div
                className="modal fade"
                id="picture"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="content"
                aria-hidden="true"
              >
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">產品圖片</h5>
                      <button
                        type="button"
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">Picture : {productNo}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr />
          {isQuery ? (
            <React.Fragment>
              <div className="row">
                <div className="col-3 text-center">
                  <h5>卷倉總和</h5>
                </div>
                <div className="col-3">
                  <h5>{rollLength}</h5>
                </div>
                <div className="col-3 text-center">
                  <h5>板倉總和</h5>
                </div>
                <div className="col-3">
                  <h5>{boardLength}</h5>
                </div>
              </div>
              <hr />
              <ClothInfoContainer clothInfoes={clothInfoes} />
            </React.Fragment>
          ) : null}
        </div>
      </div>
    );
  }
}

QueryBoard.propTypes = {
  clothInfo: PropTypes.object.isRequired,
  getClothInfoes: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  clothInfo: state.clothInfo
});

export default connect(
  mapStateToProps,
  { getClothInfoes }
)(QueryBoard);
