import React, { Component, MouseEvent } from "react";
import SearchContainer from "./SearchContainer";
import { copy } from "../../../../utilities/DeepCopy";
import { SelectedUser } from "../../../../types";
import { OutStockInfo } from "./SearchInfo";

import equal from "fast-deep-equal";

interface ToBeSubmitItem {
  selected: boolean;
  whName: string;
}

interface ToBeSubmitDateMap {
  [id: string]: ToBeSubmitItem;
}

interface ToBeSubmitMap {
  [date: string]: ToBeSubmitDateMap;
}

interface QueryResult {
  [date: string]: OutStockInfo[];
}

interface OutStockUpdateRequest {
  outStockUpdate: { [id: string]: string };
}

interface SearchBoardProps {
  queryResult: QueryResult;
  selectedUserList: SelectedUser[];
  handleSubmitClick: (request: OutStockUpdateRequest) => void;
  handleDeleteClick: (info: OutStockInfo) => void;
  downloadFile: (e: { target: { name: string; value: string } }) => void;
  handleModalShow: () => void;
  initialize: () => void;
}

interface SearchBoardState {
  toBeSubmit: ToBeSubmitMap;
}

class SearchBoard extends Component<SearchBoardProps, SearchBoardState> {
  constructor(props: SearchBoardProps) {
    super(props);
    this.state = {
      toBeSubmit: {}
    };
    this.handleToBeSubmitChange = this.handleToBeSubmitChange.bind(this);
    this.handleToBeSubmitWHChange = this.handleToBeSubmitWHChange.bind(this);
    this.allSelectMethod = this.allSelectMethod.bind(this);
    this.onSubmitClick = this.onSubmitClick.bind(this);
  }

  componentDidUpdate(prevProps: SearchBoardProps): void {
    if (!equal(prevProps.queryResult, this.props.queryResult)) {
      this.setState({
        toBeSubmit: this.initialToBeSubmit(
          this.props.queryResult,
          this.props.selectedUserList
        )
      });
    }
  }

  initialToBeSubmit(queryResult: QueryResult, selectedUserList: SelectedUser[]): ToBeSubmitMap {
    const toBeSubmit: ToBeSubmitMap = {};
    const dateArray = Object.keys(queryResult).sort();
    const userArray = this.extractUser(selectedUserList);

    dateArray.forEach(date => {
      toBeSubmit[date] = {};
      const outStockListFiltered = this.filterAlgorithm(
        date,
        queryResult,
        userArray
      );
      const waitSelectList = outStockListFiltered.filter(
        outStockRequest => outStockRequest.handled === false
      );
      waitSelectList.forEach(
        object => (toBeSubmit[date][object.id] = { selected: true, whName: "" })
      );
    });
    return toBeSubmit;
  }

  extractUser(list: SelectedUser[]): string[] {
    const array: string[] = [];

    list.forEach(object => (object.selected ? array.push(object.user) : null));

    return array;
  }

  filterAlgorithm(date: string, queryResult: QueryResult, userArray: string[]): OutStockInfo[] {
    const outStockList = queryResult[date];
    const outStockListFiltered: OutStockInfo[] = [];

    // filter outStockList by using user array
    userArray.forEach(user =>
      outStockList
        .filter(outStockInfo => outStockInfo.createdBy === user)
        .forEach(result => outStockListFiltered.push(result))
    );

    // sort the list by productNo
    return outStockListFiltered.sort(function(a, b) {
      const productA = a.productNo.toUpperCase();
      const productB = b.productNo.toUpperCase();
      if (productA < productB) {
        return -1;
      }
      if (productA > productB) {
        return 1;
      }
      return 0;
    });
  }

  handleToBeSubmitChange(date: string, checked: boolean, id: number): void {
    const listCopy = copy(this.state.toBeSubmit) as ToBeSubmitMap;

    listCopy[date][id].selected = !checked;

    this.setState({ toBeSubmit: listCopy });
  }

  handleToBeSubmitWHChange(date: string, value: string, id: number): void {
    const listCopy = { ...this.state.toBeSubmit };

    listCopy[date][id].whName = value;

    this.setState({ toBeSubmit: listCopy });
  }

  allSelectMethod(date: string, selected: boolean): void {
    const listCopy = copy(this.state.toBeSubmit) as ToBeSubmitMap;
    const keyArray = Object.keys(listCopy[date]);

    for (let i = 0; i < keyArray.length; i += 1) {
      if (listCopy[date][keyArray[i]].selected !== selected) {
        listCopy[date][keyArray[i]].selected = selected;
      }
    }

    this.setState({ toBeSubmit: listCopy });
  }

  onSubmitClick(_e: MouseEvent<HTMLButtonElement>): void {
    const stateCopy = copy(this.state.toBeSubmit) as ToBeSubmitMap;
    const requests: { [id: string]: string } = {};

    for (const day in stateCopy) {
      for (const id in stateCopy[day]) {
        if (stateCopy[day][id].selected) {
          requests[id] = stateCopy[day][id].whName;
        }
      }
    }

    const outStockUpdateRequest: OutStockUpdateRequest = { outStockUpdate: requests };

    this.props.handleSubmitClick(outStockUpdateRequest);
  }

  submitValidation(): boolean {
    const { toBeSubmit } = this.state;
    let isValid = false;

    for (const day in toBeSubmit) {
      for (const id in toBeSubmit[day]) {
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

  render(): React.ReactNode {
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
                className="btn btn-primary me-2"
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
              const outStockListFiltered = this.filterAlgorithm(
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
                  handleDeleteClick={this.props.handleDeleteClick}
                  downloadFile={this.props.downloadFile}
                  handleModalShow={this.props.handleModalShow}
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
