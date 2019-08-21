import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getClothInfoes } from "../../../actions/ClothInfoAcions";
import ShowQueryClothInfo from "./ShowQueryClothInfo";
import { Form } from "formik";

class QueryBoard extends Component {
  constructor() {
    super();
    this.state = {
      productNo: ""
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

  render() {
    const { clothInfoes } = this.props.clothInfo;
    return (
      <div className="query_clothInfo">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <Form onSubmit={this.onSubmit}>
                <div className="form-group row">
                  <label className="col-md-1 col-form-label">庫存查詢</label>
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
                  <button type="submit" className="btn btn-primary col-1">
                    查詢
                  </button>
                </div>
              </Form>
              <hr />
              <ShowQueryClothInfo clothInfoes={clothInfoes} />
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
