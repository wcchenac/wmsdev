import React, { Component } from "react";
import { setWHByImportFile } from "../../../../actions/FileActions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";

class SetWarehouse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      selectedFile: null,
    };
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onClickHandler = this.onClickHandler.bind(this);
  }

  onChangeHandler = (event) => {
    if (this.checkMimeType(event)) {
      this.setState({
        selectedFile: event.target.files,
      });
    }
  };

  checkMimeType = (event) => {
    let files = event.target.files;
    let err = [];
    const type =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    for (let i = 0; i < files.length; i += 1) {
      if (files[i].type !== type) {
        err[i] = files[i].type + " is not a supported format\n";
      }
    }

    for (let j = 0; j < err.length; j += 1) {
      event.target.value = null; // discard selected file

      toast.error(err[j]);
    }

    return true;
  };

  onClickHandler = () => {
    const data = new FormData();

    for (let i = 0; i < this.state.selectedFile.length; i += 1) {
      data.append("files", this.state.selectedFile[i]);
    }

    this.setState({ isLoading: true }, () => {
      setWHByImportFile(data)
        .then((res) => {
          this.setState({ isLoading: false });
          toast.success("upload success");
        })
        .catch((err) => {
          this.setState({ isLoading: false });
          toast.error("upload fail");
        });
    });
  };

  render() {
    return (
      <div className="container">
        <LoadingOverlay active={this.state.isLoading} spinner={<Spinner />}>
          <div style={{ height: "80vh" }}>
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="form-group files">
                  <label>上傳制式檔案(副檔名: xlsx)</label>
                  <input
                    type="file"
                    name="files"
                    multiple
                    onChange={this.onChangeHandler}
                  />
                </div>
                <div className="form-group">
                  <ToastContainer />
                </div>
                <button
                  type="button"
                  className="btn btn-success btn-block"
                  onClick={this.onClickHandler}
                >
                  上傳
                </button>
              </div>
            </div>
          </div>
        </LoadingOverlay>
      </div>
    );
  }
}

export default SetWarehouse;
