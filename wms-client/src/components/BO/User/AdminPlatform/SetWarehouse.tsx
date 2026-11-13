import React, { useState, useCallback, ChangeEvent } from "react";
import { setWHByImportFile } from "../../../../actions/FileActions";
import { toast } from "react-toastify";
import { isSessionExpired } from "../../../../utilities/notifyRequestFailed";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../Others/Spinner";

const SetWarehouse: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null);

  const checkMimeType = useCallback((event: ChangeEvent<HTMLInputElement>): boolean => {
    const files = event.target.files;
    if (!files) return false;

    const err: string[] = [];
    const type =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    for (let i = 0; i < files.length; i += 1) {
      if (files[i].type !== type) {
        err[i] = files[i].type + " is not a supported format\n";
      }
    }

    for (let j = 0; j < err.length; j += 1) {
      event.target.value = ""; // discard selected file

      toast.error(err[j]);
    }

    return true;
  }, []);

  const onChangeHandler = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    if (checkMimeType(event)) {
      setSelectedFile(event.target.files);
    }
  }, [checkMimeType]);

  const onClickHandler = useCallback((): void => {
    if (!selectedFile) return;

    const data = new FormData();

    for (let i = 0; i < selectedFile.length; i += 1) {
      data.append("files", selectedFile[i]);
    }

    setIsLoading(true);
    setWHByImportFile(data)
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
  }, [selectedFile]);

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
                  multiple
                  onChange={onChangeHandler}
                />
              </div>
              <div className="mb-3">
              </div>
              <button
                type="button"
                className="btn btn-success w-100"
                onClick={onClickHandler}
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

export default SetWarehouse;
