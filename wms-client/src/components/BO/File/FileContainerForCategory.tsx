import React, { useState, useEffect, useCallback, useMemo, MouseEvent } from "react";
import Select, { MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import { SelectOption } from "../../../types";

const NotFoundMessage = "File Not Found";

interface FileContainerForCategoryProps {
  categoryList: SelectOption[];
  fileType: string;
  filenames: string[];
  queryCategoryDetailList: () => void;
  createCategoryDetailFilename: (selectedOptions: string[]) => void;
  downloadFile: (e: MouseEvent<HTMLButtonElement>) => void;
}

const FileContainerForCategory: React.FC<FileContainerForCategoryProps> = ({
  categoryList,
  fileType,
  filenames,
  queryCategoryDetailList,
  createCategoryDetailFilename,
  downloadFile
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SelectOption[]>([]);

  const animatedComponents = useMemo(() => makeAnimated(), []);

  const handleCategorySelect = useCallback((selected: MultiValue<SelectOption>) => {
    setSelectedCategory(selected ? [...selected] : []);
  }, []);

  const handleSubmit = useCallback(() => {
    const request = selectedCategory.map((option) => option.value);
    createCategoryDetailFilename(request);
  }, [selectedCategory, createCategoryDetailFilename]);

  useEffect(() => {
    queryCategoryDetailList();
  }, [queryCategoryDetailList]);

  return (
    <div
      style={{
        border: "2px solid black",
        borderRadius: "5px",
        padding: "0.5rem 0rem",
        margin: "1rem 0rem"
      }}
    >
      <div className="container">
        <div className="row pt-1">
          <div className="col-auto">
            <p className="h5 mb-0" style={{ padding: "4px 0px" }}>
              {"庫存分類記錄本"}
            </p>
          </div>
          <div className="col-auto">
            <button
              data-toggle="modal"
              data-target="#categorySelection"
              className="btn btn-sm btn-info"
            >
              選擇分類
            </button>
            <div
              className="modal fade"
              id="categorySelection"
              tabIndex={-1}
              role="dialog"
              aria-labelledby="content"
              aria-hidden="true"
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <div className="modal-content">
                  <div
                    className="modal-header"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                      color: 'var(--color-white)',
                      borderBottom: 'none',
                      padding: 'var(--spacing-4)',
                    }}
                  >
                    <h5
                      className="modal-title"
                      style={{
                        fontWeight: 'var(--font-weight-semibold)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-2)',
                      }}
                    >
                      <i className="fa fa-tags" aria-hidden="true" />
                      選擇分類
                    </h5>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                      style={{ color: 'var(--color-white)', opacity: 0.8 }}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <Select<SelectOption, true>
                      closeMenuOnSelect
                      components={animatedComponents}
                      isSearchable
                      isClearable
                      isMulti
                      options={categoryList}
                      onChange={handleCategorySelect}
                    />
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
                      data-dismiss="modal"
                      onClick={handleSubmit}
                    >
                      確認
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div>
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "80%", padding: "0.5em 1.5em" }}>檔名</th>
                <th
                  style={{
                    width: "20%",
                    padding: "7px 0px",
                    textAlign: "center"
                  }}
                />
              </tr>
            </thead>
            <tbody>
              {filenames.length === 0
                ? null
                : filenames.map((filename, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        <td style={{ padding: "0.5em 1em" }}>
                          <button className="btn-customize" disabled>
                            {filename}
                          </button>
                        </td>
                        <td style={{ padding: "0.5em 1em" }}>
                          {filename === NotFoundMessage ? null : (
                            <div className="d-flex justify-content-center">
                              <button
                                className="btn btn-primary"
                                name={fileType}
                                value={filename}
                                onClick={downloadFile}
                              >
                                下載
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FileContainerForCategory;
