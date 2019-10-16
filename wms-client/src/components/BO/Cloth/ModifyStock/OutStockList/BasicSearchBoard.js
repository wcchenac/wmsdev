import React, { Component } from "react";
import BasicSearchInfoContainer from "./BasicSearchInfoContainer";

class BasicSearchBoard extends Component {
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
        .filter(outStockInfo => outStockInfo.user === user)
        .forEach(result => outStockListFiltered.push(result))
    );

    return outStockListFiltered;
  }

  render() {
    const { queryResult, selectedUserList } = this.props;
    const dateArray = Object.keys(queryResult);
    const userArray = this.extractUser(selectedUserList);

    return (
      <div className="accordion" id="accordion">
        {dateArray.map((date, index) => {
          let outStockListFiltered = this.filterAlgorithm(
            date,
            queryResult,
            userArray
          );

          return (
            <BasicSearchInfoContainer
              key={index}
              index={index}
              date={date}
              outStockListFiltered={outStockListFiltered}
            />
          );
        })}
      </div>
    );
  }
}

export default BasicSearchBoard;
