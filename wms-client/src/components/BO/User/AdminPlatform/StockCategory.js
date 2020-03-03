import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  getAllCategory,
  findCategoryDetails
} from "../../../../actions/StockAcions";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import { ToastContainer, toast } from "react-toastify";

class StockCategory extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      selectedCategory: []
    };
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.getAllCategory();
  }

  handleCategorySelect(selectedCategory) {
    this.setState({ selectedCategory: selectedCategory });
  }

  handleSubmit(e) {
    e.preventDefault();
    let category = this.state.selectedCategory.value;

    this.setState({ isLoading: true }, () => {
      this.props
        .findCategoryDetails(this.state.selectedCategory.value)
        .then(() => {
          toast.success(category + "分類本建立成功");
          this.setState({ isLoading: false });
        })
        .catch(() => {
          toast.error(category + "分類本建立失敗");
          this.setState({ isLoading: false });
        });
    });
  }

  render() {
    const animatedComponents = makeAnimated();

    return (
      <div className="container">
        <LoadingOverlay active={this.state.isLoading} spinner={<Spinner />}>
          <div style={{ height: "80vh" }}>
            <div className="row justify-content-center">
              <div className="col-6">
                <label>請選擇想要輸出的分類...</label>
                <Select
                  closeMenuOnSelect
                  components={animatedComponents}
                  isSearchable
                  isClearable
                  options={this.props.categoryList.stockInfoes}
                  onChange={this.handleCategorySelect}
                />
                <br />
                <button
                  type="button"
                  className="btn btn-success btn-block"
                  onClick={this.handleSubmit}
                >
                  送出
                </button>
              </div>
            </div>
            <ToastContainer />
          </div>
        </LoadingOverlay>
      </div>
    );
  }
}

StockCategory.propTypes = {
  categoryList: PropTypes.object.isRequired,
  getAllCategory: PropTypes.func.isRequired,
  findCategoryDetails: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  categoryList: state.stockInfo
});
export default connect(mapStateToProps, {
  getAllCategory,
  findCategoryDetails
})(StockCategory);
