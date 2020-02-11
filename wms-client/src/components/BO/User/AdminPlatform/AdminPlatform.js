import React, { Component } from "react";
import UserRegister from "./UserRegister";
import UserManagement from "./UserManagement/UserManagement";
import InStockByImportFile from "./InStockByImportFile";
import ScheduleMission from "./ScheduleMission";

class AdminPlatform extends Component {
  constructor() {
    super();
    this.state = {
      functionSelection: ""
    };
    this.buttonClick = this.buttonClick.bind(this);
  }

  buttonClick(e) {
    this.setState({ functionSelection: e.target.name });
  }

  renderSubFunction(functionSelection) {
    switch (functionSelection) {
      case "userRegister":
        return <UserRegister />;
      case "userManagement":
        return <UserManagement />;
      case "importFile":
        return <InStockByImportFile />;
      case "scheduleMission":
        return <ScheduleMission />;
      default:
        break;
    }
  }

  render() {
    const { functionSelection } = this.state;

    return (
      <div>
        <div className="platform">
          <div className="container">
            <div className="row" style={{ height: "80vh" }}>
              <div
                className="col-2"
                style={{
                  borderRadius: "5px",
                  backgroundColor: "papayawhip"
                }}
              >
                <p className="h5 text-center mt-2">功能列表</p>
                <button
                  className="btn btn-info btn-block"
                  name="userRegister"
                  onClick={this.buttonClick}
                >
                  新增使用者
                </button>
                <button
                  className="btn btn-info btn-block"
                  name="userManagement"
                  onClick={this.buttonClick}
                >
                  使用者管理
                </button>
                <button
                  className="btn btn-info btn-block"
                  name="importFile"
                  onClick={this.buttonClick}
                >
                  批量入庫
                </button>
                <button
                  className="btn btn-info btn-block"
                  name="scheduleMission"
                  onClick={this.buttonClick}
                >
                  任務排程
                </button>
              </div>
              <div className="col-10">
                <div style={{ height: "80vh" }}>
                  {this.renderSubFunction(functionSelection)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminPlatform;
