import React, { Component } from "react";
import OrderBoard from "./OrderBoard";
import PropTypes from "prop-types";
import { connect } from "react-redux";

class BatchAddClothInfo extends Component {
  constructor() {
    super();
    this.state = {
      inStockOrderNo: "",
      productNoList: ["12", "23", "34", "45"]
    };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  handleFormChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleFormSubmit(e) {
    e.preventDefault();
    //receive order content (productNolist)
  }
  /*
  static getDerivedStateFromProps(props, state) {
    if (props.productNoList !== state.productNoList) {
      return { productNoList: props.productNoList };
    } else {
      return null;
    }
  }
*/
  render() {
    const { productNoList } = this.state;
    return (
      <div className="batch_add_clothInfo">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <form onSubmit={this.handleFormSubmit}>
                <div className="form-group row">
                  <label className="col-2 col-form-label text-center">
                    進貨單單號查詢
                  </label>
                  <div className="col-md-3">
                    <input
                      type="text"
                      name="inStockOrderNo"
                      placeholder="請輸入進貨單單號"
                      className="form-control"
                      value={this.state.inStockOrderNo}
                      onChange={this.handleFormChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    查詢
                  </button>
                </div>
              </form>
              <hr />
              <OrderBoard productNoList={productNoList} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

BatchAddClothInfo.propTypes = {
  productNoList: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  productNoList: state.productNoList
});

export default connect(
  mapStateToProps,
  null
)(BatchAddClothInfo);
