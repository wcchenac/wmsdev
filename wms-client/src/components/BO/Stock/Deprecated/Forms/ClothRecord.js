import React from "react";
import { withFormik } from "formik";

function ClothRecord(props) {
  const { values, handleChange, onChange } = props;

  React.useEffect(() => {
    if (onChange) {
      onChange(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <div className="clothRecords">
      <div className="form-group">
        <textarea
          className="form-control form-control-lg"
          placeholder="記錄"
          name="record"
          value={values.record}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <textarea
          className="form-control form-control-lg"
          placeholder="註解"
          name="remark"
          value={values.remark}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default withFormik({
  mapPropsToValues: () => {
    return {
      record: "",
      remark: ""
    };
  }
})(ClothRecord);
