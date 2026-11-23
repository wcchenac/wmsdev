import React from "react";
import { inStockByImportFile } from "../../../../actions/FileActions";
import XlsxImportBoard from "./XlsxImportBoard";

const InStockByImportFile: React.FC = () => (
  <XlsxImportBoard uploadFiles={inStockByImportFile} />
);

export default InStockByImportFile;
