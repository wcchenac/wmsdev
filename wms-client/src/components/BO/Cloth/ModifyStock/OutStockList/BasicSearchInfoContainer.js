import React, { Component } from "react";
import BasicSearchInfo from "./BasicSearchInfo";

class BasicSearchInfoContainer extends Component {
  render() {
    const { outStockListFiltered, date, index } = this.props;

    return (
      <div className="card">
        <div
          className="card-header"
          id={"heading-" + index}
          data-toggle="collapse"
          data-parent="#accordion"
          data-target={"#collapse-" + index}
          aria-expanded="false"
          aria-controls={"collapse-" + index}
        >
          <a
            className="header-toggle"
            href={"#collapse-" + index}
            data-toggle="collapse"
            data-parent="#accordion"
          >
            日期: {date}
          </a>
        </div>
        <div
          id={"collapse-" + index}
          className="collapse"
          aria-labelledby={"heading-" + index}
        >
          <div className="card-body">
            <div className="table">
              <table className="table table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th style={{ width: "30%" }}>貨號</th>
                    <th style={{ width: "20%" }}>長度</th>
                    <th style={{ width: "20%" }}>單位</th>
                    <th style={{ width: "30%" }}>開單人員</th>
                  </tr>
                </thead>
                <tbody>
                  {outStockListFiltered.map((element, index) => (
                    <BasicSearchInfo key={index} searchInfo={element} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BasicSearchInfoContainer;
