import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getClothInfoes } from "../../../../actions/ClothInfoAcions";
import ClothInfoContainer from "./ClothInfoContainer";

class QueryBoard extends Component {
  constructor() {
    super();
    this.state = {
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
    this.props.getClothInfoes(this.state.productNo);
  }

  componentDidUpdate(prevProps) {
    if (this.props.clothInfo.clothInfoes !== prevProps.clothInfo.clothInfoes) {
      this.setState({ clothInfoes: this.props.clothInfo.clothInfoes });
    }
  }

  render() {
    const sumTotalLength = clothInfoes => {
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
    };

    const { clothInfoes } = this.state;
    const { rollLength, boardLength } = sumTotalLength(clothInfoes);

    return (
      <div className="query_clothInfo">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <form onSubmit={this.onSubmit}>
                <div className="form-group row">
                  <label className="col-1 col-form-label text-center">
                    貨號查詢
                  </label>
                  <div className="col-md-3">
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
              <hr />
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
            </div>
          </div>
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
