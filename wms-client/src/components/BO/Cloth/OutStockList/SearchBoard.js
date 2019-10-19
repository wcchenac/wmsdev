import React, { Component } from "react";
import SearchContainer from "./SearchContainer";

class SearchBoard extends Component {
  extractUser(list) {
    const array = [];

    list.map(object => (object.selected ? array.push(object.user) : null));

    return array;
  }

  filterAlgorithm(date, queryResult, userArray) {
    let outStockList = queryResult[date];
    let outStockListFiltered = [];

    // filter outStockList by using user array
    userArray.forEach(user =>
      outStockList
        .filter(outStockInfo => outStockInfo.createdBy === user)
        .forEach(result => outStockListFiltered.push(result))
    );

    // sort the list by productNo
    return outStockListFiltered.sort(function(a, b) {
      let productA = a.productNo.toUpperCase();
      let productB = b.productNo.toUpperCase();
      if (productA < productB) {
        return -1;
      }
      if (productA < productB) {
        return 1;
      }
      return 0;
    });
  }

  render() {
    const { queryResult, selectedUserList } = this.props;
    const dateArray = Object.keys(queryResult).sort();
    const userArray = this.extractUser(selectedUserList);

    /*
    return (
      <div className="accordion" id="accordion">
        {dateArray.map((date, index) => {
          let outStockListFiltered = this.filterAlgorithm(
            date,
            queryResult,
            userArray
          );

          return (
            <SearchContainer
              key={index}
              index={index}
              date={date}
              outStockListFiltered={outStockListFiltered}
            />
          );
        })}
      </div>
    );
    */

    return (
      <React.Fragment>
        <nav>
          <div
            className="nav nav-pills nav-justified"
            id="nav-tab"
            role="tablist"
          >
            {dateArray.map((date, index) => {
              return (
                <a
                  className={
                    index === 0
                      ? "nav-item nav-link active"
                      : "nav-item nav-link"
                  }
                  id={"nav-tab" + index}
                  key={index}
                  data-toggle="tab"
                  href={"#nav-" + index}
                  role="tab"
                  aria-controls={"nav-" + index}
                  aria-selected={index === 0}
                >
                  {date}
                </a>
              );
            })}
          </div>
        </nav>
        <div className="tab-content" id="nav-tabContent">
          {dateArray.map((date, index) => {
            let outStockListFiltered = this.filterAlgorithm(
              date,
              queryResult,
              userArray
            );

            return (
              <SearchContainer
                key={index}
                index={index}
                date={date}
                outStockListFiltered={outStockListFiltered}
              />
            );
          })}
        </div>
      </React.Fragment>
    );
  }
}
export default SearchBoard;
