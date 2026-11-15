import React, { Component, MouseEvent } from "react";
import SearchContainer from "./SearchContainer";
import { copy } from "../../../../utilities/DeepCopy";
import { SelectedUser, OutStockUpdateRequest } from "../../../../types";
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
  /** Date tab currently shown; falls back to the first date when unset or no longer listed. */
  activeDate: string | null;
}

class SearchBoard extends Component<SearchBoardProps, SearchBoardState> {
  constructor(props: SearchBoardProps) {
    super(props);
    this.state = {
      toBeSubmit: {},
      activeDate: null
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
    } else if (
      this.props.queryResult !== undefined &&
      !equal(prevProps.selectedUserList, this.props.selectedUserList)
    ) {
      // Drop rows the user filter just hid, and keep warehouse choices for rows still shown.
      this.setState({
        toBeSubmit: this.retainVisibleToBeSubmit(
          this.state.toBeSubmit,
          this.props.queryResult,
          this.props.selectedUserList
        )
      });
    }
  }

  retainVisibleToBeSubmit(
    current: ToBeSubmitMap,
    queryResult: QueryResult,
    selectedUserList: SelectedUser[]
  ): ToBeSubmitMap {
    const visible = this.initialToBeSubmit(queryResult, selectedUserList);
    for (const date of Object.keys(visible)) {
      for (const id of Object.keys(visible[date])) {
        const existing = current[date]?.[id];
        if (existing) {
          visible[date][id] = { selected: existing.selected, whName: existing.whName };
        }
      }
    }
    return visible;
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
    const listCopy = copy(this.state.toBeSubmit) as ToBeSubmitMap;

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

  /**
   * Selected rows that are on screen for the current user filter.
   * Hidden rows stay out of both validation and the submit payload.
   */
  visibleSelection(): { id: string; whName: string }[] {
    const { queryResult, selectedUserList } = this.props;
    const { toBeSubmit } = this.state;
    if (queryResult === undefined) {
      return [];
    }

    const userArray = this.extractUser(selectedUserList);
    const selected: { id: string; whName: string }[] = [];

    for (const day of Object.keys(toBeSubmit)) {
      if (queryResult[day] === undefined) {
        continue;
      }
      const visibleIds = new Set(
        this.filterAlgorithm(day, queryResult, userArray)
          .filter((row) => row.handled === false)
          .map((row) => String(row.id))
      );
      for (const id of Object.keys(toBeSubmit[day])) {
        const item = toBeSubmit[day][id];
        if (item.selected && visibleIds.has(id)) {
          selected.push({ id, whName: item.whName });
        }
      }
    }
    return selected;
  }

  onSubmitClick(_e: MouseEvent<HTMLButtonElement>): void {
    const requests: { [id: string]: string } = {};

    this.visibleSelection().forEach((item) => {
      requests[item.id] = item.whName;
    });

    const outStockUpdateRequest: OutStockUpdateRequest = { outStockUpdate: requests };

    this.props.handleSubmitClick(outStockUpdateRequest);
  }

  /**
   * The save button is disabled when any visible selected row has no warehouse,
   * and when nothing visible is selected. An empty warehouse on an earlier date
   * must stay disabled even if a later date is filled in.
   */
  submitValidation(): boolean {
    const selected = this.visibleSelection();
    if (selected.some((item) => equal(item.whName, ""))) {
      return true;
    }
    return selected.length === 0;
  }

  render(): React.ReactNode {
    const { queryResult, selectedUserList } = this.props;
    const { toBeSubmit, activeDate } = this.state;

    if (queryResult === undefined) {
      return null;
    } else {
      const dateArray = Object.keys(queryResult).sort();
      const userArray = this.extractUser(selectedUserList);
      const currentDate =
        activeDate !== null && dateArray.includes(activeDate)
          ? activeDate
          : dateArray[0];

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
                      date === currentDate
                        ? "nav-item nav-link active"
                        : "nav-item nav-link"
                    }
                    id={"nav-tab-" + date}
                    key={index}
                    href={"#nav-" + date}
                    role="tab"
                    aria-controls={"nav-" + date}
                    aria-selected={date === currentDate}
                    onClick={(e) => {
                      e.preventDefault();
                      this.setState({ activeDate: date });
                    }}
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
                  active={date === currentDate}
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
