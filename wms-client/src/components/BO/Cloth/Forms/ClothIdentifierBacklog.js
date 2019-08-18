import React from "react";
import { withFormik } from "formik";

function ClothIdentifierBacklog(props) {
  const { values, handleChange, onChange } = props;

  React.useEffect(() => {
    if (onChange) {
      onChange(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <div className="clothIdentifierBacklog">
      <div className="form-group">
        <input
          type="text"
          className="form-control form-control-lg "
          placeholder="貨號"
          name="productNo"
          value={values.productNo}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="批號"
          name="lotNo"
          value={values.lotNo}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="型態"
          name="type"
          value={values.type}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="長度"
          name="length"
          value={values.length}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default withFormik({
  mapPropsToValues: () => {
    return {
      productNo: "",
      lotNo: "",
      type: "",
      length: ""
    };
  }
})(ClothIdentifierBacklog);
