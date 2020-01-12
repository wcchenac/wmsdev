import React from "react";
import Loader from "react-loader-spinner";

export function Spinner() {
  return (
    <React.Fragment>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Loader type="ThreeDots" color="#2BAD60" height={100} width={100} />
      </div>
    </React.Fragment>
  );
}
