import React, { Component } from "react";
import SearchContainer from "./SearchContainer";
import { copy } from "../../../../utilities/DeepCopy";

const equal = require("fast-deep-equal");

class SearchBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toBeSubmit: {}
    };
    this.handleToBeSubmitChange = this.handleToBeSubmitChange.bind(this);
    this.handleToBeSubmitWHChange = this.handleToBeSubmitWHChange.bind(this);
    this.allSelectMethod = this.allSelectMethod.bind(this);
    this.onSubmitClick = this.onSubmitClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (!equal(prevProps.queryResult, this.props.queryResult)) {
      this.setState({
        toBeSubmit: this.initialToBeSubmit(
          this.props.queryResult,
          this.props.selectedUserList
        )
      });
    }
  }

  initialToBeSubmit(queryResult, selectedUserList) {
    let toBeSubmit = {};
    const dateArray = Object.keys(queryResult).sort();
    const userArray = this.extractUser(selectedUserList);

    dateArray.forEach(date => {
      toBeSubmit[date] = {};
      let outStockListFiltered = this.filterAlgorithm(
        date,
        queryResult,
        userArray
      );
      let waitSelectList = outStockListFiltered.filter(
        outStockRequest => outStockRequest.handled === false
      );
      waitSelectList.map(
        object => (toBeSubmit[date][object.id] = { selected: true, whName: "" })
      );
    });
    return toBeSubmit;
  }

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

  handleToBeSubmitChange(date, checked, id) {
    let listCopy = copy(this.state.toBeSubmit);

    listCopy[date][id].selected = !checked;

    this.setState({ toBeSubmit: listCopy });
  }

  handleToBeSubmitWHChange(date, value, id) {
    let listCopy = { ...this.state.toBeSubmit };

    listCopy[date][id].whName = value;

    this.setState({ toBeSubmit: listCopy });
  }

  allSelectMethod(date, boolean) {
    let listCopy = copy(this.state.toBeSubmit);
    let keyArray = Object.keys(listCopy[date]);

    for (let i = 0; i < keyArray.length; i += 1) {
      if (listCopy[date][keyArray[i]].selected !== boolean) {
        listCopy[date][keyArray[i]].selected = boolean;
      }
    }

    this.setState({ toBeSubmit: listCopy });
  }

  onSubmitClick() {
    let stateCopy = copy(this.state.toBeSubmit);
    let requests = {};

    for (let day in stateCopy) {
      for (let id in stateCopy[day]) {
        if (stateCopy[day][id].selected) {
          requests[id] = stateCopy[day][id].whName;
        }
      }
    }

    let outStockUpdateRequest = { outStockUpdate: requests };

    this.props.handleSubmitClick(outStockUpdateRequest);
  }

  submitValidation() {
    const { toBeSubmit } = this.state;
    var isValid = false;

    for (let day in toBeSubmit) {
      for (let id in toBeSubmit[day]) {
        if (toBeSubmit[day][id].selected) {
          if (!equal(toBeSubmit[day][id].whName, "")) {
            isValid = true;
          } else {
            isValid = false;
            break;
          }
        }
      }
    }

    return !isValid;
  }

  render() {
    const { queryResult, selectedUserList } = this.props;
    const { toBeSubmit } = this.state;

    if (queryResult === undefined) {
      return null;
    } else {
      const dateArray = Object.keys(queryResult).sort();
      const userArray = this.extractUser(selectedUserList);

      return (
        <React.Fragment>
          <div className="row justify-content-end">
            <div className="col-md-auto">
              <button
                className="btn btn-primary mr-2"
                disabled={this.submitValidation()}
                onClick={this.onSubmitClick}
              >
                儲存
              </button>
            </div>
          </div>
          <br />
          <nav>
            <div className="nav nav-pills" id="nav-tab" role="tablist">
              {dateArray.map((date, index) => {
                return (
                  <a
                    className={
                      index === 0
                        ? "nav-item nav-link active"
                        : "nav-item nav-link"
                    }
                    id={"nav-tab-" + date}
                    key={index}
                    data-toggle="tab"
                    href={"#nav-" + date}
                    role="tab"
                    aria-controls={"nav-" + date}
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
                  toBeSubmit={toBeSubmit[date]}
                  allSelectMethod={this.allSelectMethod}
                  handleToBeSubmitChange={this.handleToBeSubmitChange}
                  handleToBeSubmitWHChange={this.handleToBeSubmitWHChange}
                  cancelShip={this.props.cancelShip}
                  deleteOutStock={this.props.deleteOutStock}
                  initialize={this.props.initialize}
                />
              );
            })}
          </div>
        </React.Fragment>
      );
    }
  }
}
export default SearchBoard;
