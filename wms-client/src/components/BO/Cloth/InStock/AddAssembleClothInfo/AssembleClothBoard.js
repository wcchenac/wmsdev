import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import QueryAssemble from "./QueryAssemble";
import ClothInfoContainer from "./ClothInfoContainer";
import { batchCreateClothInfoes } from "../../../../../actions/ClothInfoAcions";

class AssembleClothBoard extends Component {
  constructor() {
    super();
    this.state = {
      isQuery: false,
      assembleOrderNo: "",
      assembleOrderContent: {}
    };
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
    this.handleAssembleRequestSubmit = this.handleAssembleRequestSubmit.bind(
      this
    );
    this.getInitialize = this.getInitialize.bind(this);
  }

  getInitialize() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }

    this.setState({
      isQuery: false,
      assembleOrderNo: "",
      assembleOrderContent: {}
    });
  }

  handleQueryChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleQuerySubmit(e) {
    e.preventDefault();
    console.log(this.state.assembleOrderNo);
    this.setState({
      isQuery: true,
      assembleOrderContent: {
        productNo: "Z12345",
        type: "整支",
        length: "1000",
        unit: "碼"
      }
    });
  }

  handleAssembleRequestSubmit(inStockRequests) {
    // this.props.batchCreateClothInfoes(inStockRequests);
    console.log(inStockRequests);
  }

  componentDidUpdate(prevProps) {
    if (this.props.assembleOrderContent !== prevProps.assembleOrderContent) {
      this.setState({ assembleOrderContent: this.props.assembleOrderContent });
    }
  }

  render() {
    const { isQuery, assembleOrderContent } = this.state;

    return (
      <div className="assemble_clothInfo">
        <div className="container">
          <QueryAssemble
            handleQueryChange={this.handleQueryChange}
            handleQuerySubmit={this.handleQuerySubmit}
          />
          <hr />
          {isQuery ? (
            <ClothInfoContainer
              assembleOrderContent={assembleOrderContent}
              handleAssembleRequestSubmit={this.handleAssembleRequestSubmit}
              getInitialize={this.getInitialize}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

AssembleClothBoard.propTypes = {
  assembleOrderContent: PropTypes.object.isRequired,
  batchCreateClothInfoes: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  assembleOrderContent: state.assembleOrderContent
});

export default connect(
  mapStateToProps,
  { batchCreateClothInfoes }
)(AssembleClothBoard);
