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
    records: {}
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
      records: values
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
              type="button"
              className="btn btn-primary btn-block mt-4"
              data-toggle="modal"
              data-target="#ModalCenter"
            >
              預覽
            </button>
            <div
              className="modal fade"
              id="ModalCenter"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="ModalCenterTitle"
              aria-hidden="true"
            >
              <div
                className="modal-dialog modal-dialog-scrollable-centered"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="ModalCenterTitle">
                      預覽結果
                    </h5>
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
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">貨號</th>
                          <th scope="col">批號</th>
                          <th scope="col">型態</th>
                          <th scope="col">長度</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="col">
                            {formValues.clothIdentifierBacklog.productNo}
                          </th>
                          <th scope="col">
                            {formValues.clothIdentifierBacklog.lotNo}
                          </th>
                          <th scope="col">
                            {formValues.clothIdentifierBacklog.type}
                          </th>
                          <th scope="col">
                            {formValues.clothIdentifierBacklog.length}
                          </th>
                        </tr>
                      </tbody>
                    </table>
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">色碼</th>
                          <th scope="col">缺陷</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="col">{formValues.clothInfo.color}</th>
                          <th scope="col">{formValues.clothInfo.defect}</th>
                        </tr>
                      </tbody>
                    </table>
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">註解</th>
                          <th scope="col">記錄</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="col">{formValues.records.remark}</th>
                          <th scope="col">{formValues.records.record}</th>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-dismiss="modal"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleOnSubmit}
                    >
                      送出
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
