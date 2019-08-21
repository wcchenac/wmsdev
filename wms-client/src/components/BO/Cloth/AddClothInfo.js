import React, { useState } from "react";
import ClothIdentifierBacklog from "./Forms/ClothIdentifierBacklog";
import ClothRecord from "./Forms/ClothRecord";
import ClothInfo from "./Forms/ClothInfo";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createClothInfo } from "../../../actions/ClothInfoAcions";

function AddClothInfo(props) {
  const [formValues, setFormValues] = useState({
    clothIdentifierBacklog: {},
    clothInfo: {},
    records: []
  });

  const { history, createClothInfo } = props;

  function handleIdentifierBacklogChange(values) {
    setFormValues({
      ...formValues,
      clothIdentifierBacklog: values
    });
  }

  function handleClothInfoChange(values) {
    setFormValues({
      ...formValues,
      clothInfo: values
    });
  }

  function handleClothRecordChange(values) {
    setFormValues({
      ...formValues,
      records: [...formValues.records, values]
    });
  }

  function handleOnSubmit() {
    console.log(formValues);
    createClothInfo(formValues, history);
  }

  return (
    <div className="cloth_info">
      <div className="container">
        <div className="row">
          <div className="col-md-8 m-auto">
            <p className="h2 text-center">入庫基本資料</p>
            <hr />
            <ClothIdentifierBacklog onChange={handleIdentifierBacklogChange} />
            <ClothInfo onChange={handleClothInfoChange} />
            <ClothRecord onChange={handleClothRecordChange} />
            <button
              type="submit"
              className="btn btn-primary btn-block mt-4"
              onClick={handleOnSubmit}
            >
              送出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
AddClothInfo.propTypes = {
  createClothInfo: PropTypes.func.isRequired
};
export default connect(
  null,
  { createClothInfo }
)(AddClothInfo);
