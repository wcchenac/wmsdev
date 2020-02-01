import React, { Component } from "react";
import { inStockByImportFile } from "../../../../actions/FileActions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";

class InStockByImportFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      selectedFile: null
    };
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onClickHandler = this.onClickHandler.bind(this);
  }

  onChangeHandler = event => {
    if (this.checkMimeType(event)) {
      this.setState({
        selectedFile: event.target.files
      });
    }
  };

  checkMimeType = event => {
    let files = event.target.files;
    let err = "";
    const type =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    for (let i = 0; i < files.length; i += 1) {
      if (files[i].type !== type) {
        err += files[i].type + " is not a supported format\n";
      }
    }
    if (err !== "") {
      event.target.value = null; // discard selected file
      console.log(err);
      return false;
    }

    return true;
  };

  onClickHandler = () => {
    const data = new FormData();

    for (let i = 0; i < this.state.selectedFile.length; i += 1) {
      data.append("files", this.state.selectedFile[i]);
    }

    this.setState({ isLoading: true }, () => {
      inStockByImportFile(data)
        .then(res => {
          this.setState({ isLoading: false });
          toast.success("upload success");
        })
        .catch(err => {
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
          <div className="row">
            <div className="offset-md-3 col-md-6">
              <div className="form-group files">
                <label>Upload Your File </label>
                <input
                  type="file"
                  name="files"
                  multiple
                  onChange={this.onChangeHandler}
                />
              </div>
              <div class="form-group">
                <ToastContainer />
              </div>
              <button
                type="button"
                className="btn btn-success btn-block"
                onClick={this.onClickHandler}
              >
                Upload
              </button>
            </div>
          </div>
          </div>
        </LoadingOverlay>
      </div>
    );
  }
}

export default InStockByImportFile;
