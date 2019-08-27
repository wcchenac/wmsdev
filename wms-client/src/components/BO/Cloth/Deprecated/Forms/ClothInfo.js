import React from "react";
import { withFormik } from "formik";

function ClothInfo(props) {
  const { values, handleChange, onChange } = props;

  React.useEffect(() => {
    if (onChange) {
      onChange(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <div className="clothInfo">
      <div className="form-group">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="色號"
          name="color"
          value={values.color}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <textarea
          className="form-control form-control-lg"
          placeholder="缺陷"
          name="defect"
          value={values.defect}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default withFormik({
  mapPropsToValues: () => {
    return {
      color: "",
      defect: ""
    };
  }
})(ClothInfo);
