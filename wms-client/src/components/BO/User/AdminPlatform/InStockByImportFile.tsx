import React, { useState, useCallback, ChangeEvent } from "react";
import { inStockByImportFile } from "../../../../actions/FileActions";
import { toast } from "react-toastify";
import { isSessionExpired } from "../../../../utilities/notifyRequestFailed";
import { acceptXlsxSelection } from "./xlsxImport";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";

const InStockByImportFile: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File[] | null>(null);

  const onChangeHandler = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    if (acceptXlsxSelection(event)) {
      setSelectedFile(Array.from(event.target.files ?? []));
    } else {
      setSelectedFile(null);
    }
  }, []);

  const onClickHandler = useCallback((): void => {
    if (isLoading || !selectedFile || selectedFile.length === 0) {
      return;
    }

    const data = new FormData();

    for (let i = 0; i < selectedFile.length; i += 1) {
      data.append("files", selectedFile[i]);
    }

    setIsLoading(true);
    inStockByImportFile(data)
      .then(() => {
        setIsLoading(false);
        toast.success("upload success");
      })
      .catch((error) => {
        setIsLoading(false);
        if (!isSessionExpired(error)) {
          toast.error("upload fail");
        }
      });
  }, [isLoading, selectedFile]);

  const uploadDisabled = isLoading || !selectedFile || selectedFile.length === 0;

  return (
    <div className="container">
      <LoadingOverlay active={isLoading} spinner={<Spinner />}>
        <div style={{ height: "80vh" }}>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="mb-3 files">
                <label>上傳制式檔案(副檔名: xlsx)</label>
                <input
                  type="file"
                  name="files"
                  accept=".xlsx"
                  multiple
                  onChange={onChangeHandler}
                />
                {selectedFile && selectedFile.length > 0 ? (
                  <div className="mt-2 text-break">
                    {selectedFile.map((file) => file.name).join(", ")}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="btn btn-success w-100"
                onClick={onClickHandler}
                disabled={uploadDisabled}
              >
                上傳
              </button>
            </div>
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default InStockByImportFile;
