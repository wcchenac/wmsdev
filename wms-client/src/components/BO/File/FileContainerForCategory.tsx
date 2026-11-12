import React, { Component } from "react";
import { isEmpty } from "../../../utilities/IsEmpty";
import Select from "react-select";
import { animatedSelectComponents } from "../../../types/select";

import type { ValueType } from "react-select";
import type { CategoryChoice } from "../User/AdminPlatform/StockCategory";

interface Props {
  queryCategoryDetailList: () => void;
  createCategoryDetailFilename: (selected: string[]) => void;
  fileType: string;
  categoryList: CategoryChoice[];
  filenames: string[];
  downloadFile: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface State {
  selectedCategory: ValueType<CategoryChoice, true>;
}


const NotFoundMessage = "File Not Found";

class FileContainerForCategory extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedCategory: [] as ValueType<CategoryChoice, true>
    };
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleCategorySelect(selectedCategory: ValueType<CategoryChoice, true>) {
    this.setState({ selectedCategory: selectedCategory });
  }

  handleSubmit() {
    const request: string[] = [];

    this.state.selectedCategory?.forEach(object => {
      request.push(object.value);
    });

    this.props.createCategoryDetailFilename(request);
  }

  componentDidMount() {
    this.props.queryCategoryDetailList();
  }

  render() {
    const animatedComponents = animatedSelectComponents<CategoryChoice, true>();
    const { categoryList, fileType, filenames } = this.props;

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
                    <div className="modal-header">
                      <h5 className="modal-title">選擇分類</h5>
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
                      <Select
                        closeMenuOnSelect
                        components={animatedComponents}
                        isSearchable
                        isClearable
                        isMulti
                        options={categoryList}
                        onChange={this.handleCategorySelect}
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
                        onClick={this.handleSubmit}
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
                {isEmpty(filenames)
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
                                  onClick={this.props.downloadFile}
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
  }
}

export default FileContainerForCategory;
