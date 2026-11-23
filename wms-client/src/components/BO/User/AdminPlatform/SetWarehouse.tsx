import React from "react";
import { setWHByImportFile } from "../../../../actions/FileActions";
import XlsxImportBoard from "./XlsxImportBoard";

const SetWarehouse: React.FC = () => (
  <XlsxImportBoard uploadFiles={setWHByImportFile} />
);

export default SetWarehouse;
