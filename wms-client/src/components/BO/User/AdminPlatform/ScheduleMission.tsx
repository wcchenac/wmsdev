import React, { Component } from "react";
import { missionTrigger } from "../../../../actions/StockAcions";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface State {
  isLoading: boolean;
}

class ScheduleMission extends Component<Record<string, never>, State> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      isLoading: false,
    };
    this.handleMissionTrigger = this.handleMissionTrigger.bind(this);
  }

  handleMissionTrigger(e: React.MouseEvent<HTMLButtonElement>) {
    const arr = (e.target as HTMLButtonElement).name.split("-");

    this.setState({ isLoading: true }, () => {
      missionTrigger(arr[0], arr[1]).then(() => {
        this.setState({ isLoading: false });
        toast.success("Misson Complete");
      });
    });
  }

  render() {
    return (
      <div className="container">
        <LoadingOverlay active={this.state.isLoading} spinner={<Spinner />}>
          <div style={{ height: "80vh" }}>
            <button
              className="btn btn-primary mr-2"
              name="daily-stockCompare"
              onClick={this.handleMissionTrigger}
            >
              每日比對
            </button>
            <button
              className="btn btn-primary mr-2"
              name="weekly-syncProductCategory"
              onClick={this.handleMissionTrigger}
            >
              貨號類別同步
            </button>
            <button
              className="btn btn-primary"
              name="weekly-syncProductCategory"
              // onClick={this.handleMissionTrigger}
              disabled
            >
              貨號品名同步
            </button>
          </div>
          <ToastContainer />
        </LoadingOverlay>
      </div>
    );
  }
}

export default ScheduleMission;
