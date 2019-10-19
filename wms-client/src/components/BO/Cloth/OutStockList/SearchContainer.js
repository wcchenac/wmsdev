import React, { Component } from "react";
import SearchInfo from "./SearchInfo";

class SearchContainer extends Component {
  render() {
    const { outStockListFiltered, index } = this.props;
    /*
    return (
      <div className="card">
        <div
          className="card-header"
          id={"heading-" + index}
          data-toggle="collapse"
          data-parent="#accordion"
          data-target={"#collapse-" + index}
          aria-expanded={outStockListFiltered.length !== 0}
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
                    <th style={{ width: "25%" }}>貨號</th>
                    <th style={{ width: "10%" }}>型態</th>
                    <th style={{ width: "15%" }}>長度</th>
                    <th style={{ width: "10%" }}>單位</th>
                    <th style={{ width: "20%" }}>出庫原因</th>
                    <th style={{ width: "20%" }}>開單人員</th>
                  </tr>
                </thead>
                <tbody>
                  {outStockListFiltered.map((element, index) => (
                    <SearchInfo key={index} searchInfo={element} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
    */

    return (
      <React.Fragment>
        <div
          className={
            index === 0 ? "tab-pane fade show active" : "tab-pane fade"
          }
          id={"nav-" + index}
          role="tabpanel"
          aria-labelledby={"nav-tab" + index}
        >
          <div className="table-wrapper-scroll-y my-custom-scrollbar">
            <table className="table table-hover">
              <thead className="thead-dark">
                <tr>
                  <th style={{ width: "5%" }}>
                    <input type="checkbox" />
                  </th>
                  <th style={{ width: "25%" }}>貨號</th>
                  <th style={{ width: "10%" }}>型態</th>
                  <th style={{ width: "10%" }}>長度</th>
                  <th style={{ width: "10%" }}>單位</th>
                  <th style={{ width: "20%" }}>出庫原因</th>
                  <th style={{ width: "20%" }}>開單人員</th>
                  {/*
                  <th style={{ width: "25%" }}>貨號</th>
                  <th style={{ width: "10%" }}>型態</th>
                  <th style={{ width: "15%" }}>長度</th>
                  <th style={{ width: "10%" }}>單位</th>
                  <th style={{ width: "20%" }}>出庫原因</th>
                  <th style={{ width: "20%" }}>開單人員</th>
                */}
                </tr>
              </thead>
              <tbody>
                {outStockListFiltered.map((element, index) => (
                  <SearchInfo key={index} searchInfo={element} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default SearchContainer;
