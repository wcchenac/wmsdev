import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getClothInfoes,
  purgeOldClothInfoIsShiped
} from "../../../../actions/ClothInfoAcions";
import ShowClothInfo from "./ShowClothInfo";

class ModifyBoard extends Component {
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

  static getDerivedStateFromProps(props, state) {
    if (props.clothInfo.clothInfoes !== state.clothInfoes) {
      return { clothInfoes: props.clothInfo.clothInfoes };
    } else {
      return null;
    }
  }

  render() {
    const { clothInfoes } = this.state;
    return (
      <div className="modify_clothInfo">
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
              <ShowClothInfo
                clothInfoes={clothInfoes}
                handleShip={this.props.purgeOldClothInfoIsShiped}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ModifyBoard.propTypes = {
  clothInfo: PropTypes.object.isRequired,
  getClothInfoes: PropTypes.func.isRequired,
  purgeOldClothInfoIsShiped: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  clothInfo: state.clothInfo
});

export default connect(
  mapStateToProps,
  { getClothInfoes, purgeOldClothInfoIsShiped }
)(ModifyBoard);
