import React, { Component } from "react";
import ShrinkInfo from "./ShrinkInfo";
import { DataGrid } from "@material-ui/data-grid";

class ShrinkInfoContainer extends Component {
  render() {
    const { shrinkList } = this.props;

    if (shrinkList.length === 0) {
      return (
        <div className="alert alert-warning text-center" role="alert">
          查無資料
        </div>
      );
    } else {
      const { header } = [
        { field: "productNo", headerName: "貨號" },
        { field: "lotNo", headerName: "批號" },
        { field: "type", headerName: "型態" },
        { field: "quantity", headerName: "數量" },
        { field: "unit", headerName: "單位" },
        { field: "color", headerName: "色號" },
        { field: "defect", headerName: "瑕疵" },
        { field: "shrinkButton1", headerName: "", sortable: false },
        { field: "shrinkButton2", headerName: "", sortable: false },
        { field: "cancelButton", headerName: "", sortable: false },
      ];

      return (
        <div>
          <div style={{ height: 100, width: "100%" }}>
            <DataGrid columns={header} />
          </div>
          <div className="table-wrapper-scroll-y scrollbar-75">
            <table className="table table-hover">
              <thead className="thead-dark">
                <tr>
                  <th style={{ width: "18%" }}>
                    <div className="pl-3">貨號</div>
                  </th>
                  <th style={{ width: "8%" }}>
                    <div className="pl-1">批號</div>
                  </th>
                  <th style={{ width: "8%" }}>
                    {" "}
                    <div className="pl-2">型態</div>
                  </th>
                  <th style={{ width: "9%" }}>
                    {" "}
                    <div className="pl-1">數量</div>
                  </th>
                  <th style={{ width: "8%" }}>
                    {" "}
                    <div className="pl-1">單位</div>
                  </th>
                  <th style={{ width: "7.5%" }}>色號</th>
                  <th style={{ width: "9%" }}>
                    {" "}
                    <div className="pl-2">瑕疵</div>
                  </th>
                  <th style={{ width: "10.5%" }} />
                  <th style={{ width: "10.5%" }} />
                  <th style={{ width: "10.5%" }} />
                </tr>
              </thead>
              <tbody>
                {shrinkList.map((stockInfo, index) => (
                  <ShrinkInfo
                    key={index}
                    stockInfo={stockInfo}
                    onModifyClick={this.props.onModifyClick}
                    onCancelShrinkClick={this.props.onCancelShrinkClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }
}

export default ShrinkInfoContainer;
