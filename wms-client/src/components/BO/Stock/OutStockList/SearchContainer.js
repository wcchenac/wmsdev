import React, { PureComponent } from "react";
import SearchInfo from "./SearchInfo";
import HeaderCheckBox from "./HeaderCheckBox";

const equal = require("fast-deep-equal");

function initialState(outStockListFiltered) {
  if (outStockListFiltered === undefined) {
    return {
      outStockListFiltered: [],
      toBeSubmit: {},
      headerCheckBoxChecked: false
    };
  } else {
    let waitSelectList = outStockListFiltered.filter(
      outStockRequest => outStockRequest.handled === false
    );
    let toBeSubmit = initialSelectList(waitSelectList);

    return {
      outStockListFiltered: outStockListFiltered,
      toBeSubmit: toBeSubmit,
      headerCheckBoxChecked: defaultCheckedAlgorithm(toBeSubmit)
    };
  }
}

function initialSelectList(waitSelectList) {
  let selectList = {};

  waitSelectList.map(
    object => (selectList[object.id] = { selected: true, whName: "" })
  );

  return selectList;
}

function defaultCheckedAlgorithm(selectList) {
  if (selectList === undefined) {
    return false;
  }

  let keyArray = Object.keys(selectList);

  if (keyArray.length === 0) {
    return false;
  }

  let checked = true;

  for (let i = 0; i < keyArray.length; i += 1) {
    if (!selectList[keyArray[i]].selected) {
      checked = false;
      break;
    }
  }

  return checked;
}

class SearchContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = initialState(this.props.outStockListFiltered);
    this.onHeaderCheckBoxChange = this.onHeaderCheckBoxChange.bind(this);
    this.onInfoCheckBoxChange = this.onInfoCheckBoxChange.bind(this);
    this.onInfoWHChange = this.onInfoWHChange.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.outStockListFiltered === undefined) {
      return null;
    }

    let waitSelectList = nextProps.outStockListFiltered.filter(
      outStockRequest => outStockRequest.handled === false
    );
    let toBeSubmit = initialSelectList(waitSelectList);

    if (
      !equal(prevState.outStockListFiltered, nextProps.outStockListFiltered)
    ) {
      return {
        outStockListFiltered: nextProps.outStockListFiltered,
        toBeSubmit: toBeSubmit,
        headerCheckBoxChecked: defaultCheckedAlgorithm(toBeSubmit)
      };
    }

    if (nextProps.toBeSubmit === undefined) {
      return null;
    } else if (!equal(prevState.toBeSubmit, nextProps.toBeSubmit)) {
      return {
        toBeSubmit: nextProps.toBeSubmit,
        headerCheckBoxChecked: defaultCheckedAlgorithm(nextProps.toBeSubmit)
      };
    }

    return null;
  }

  onHeaderCheckBoxChange(checked) {
    if (checked) {
      this.props.allSelectMethod(this.props.date, false);
    } else {
      this.props.allSelectMethod(this.props.date, true);
    }
  }

  onInfoCheckBoxChange(checked, id) {
    this.props.handleToBeSubmitChange(this.props.date, checked, id);
  }

  onInfoWHChange(value, id) {
    this.props.handleToBeSubmitWHChange(this.props.date, value, id);
  }

  render() {
    const { outStockListFiltered, index, date } = this.props;
    const { toBeSubmit, headerCheckBoxChecked } = this.state;

    return (
      <React.Fragment>
        <div
          className={
            index === 0 ? "tab-pane fade show active" : "tab-pane fade"
          }
          id={"nav-" + date}
          role="tabpanel"
          aria-labelledby={"nav-tab-" + date}
        >
          <div className="table-wrapper-scroll-y my-custom-scrollbar">
            <table className="table table-hover">
              <thead className="thead-dark">
                <tr>
                  <th style={{ width: "3%" }}>
                    <HeaderCheckBox
                      checked={headerCheckBoxChecked}
                      onHeaderCheckBoxChange={this.onHeaderCheckBoxChange}
                    />
                  </th>
                  <th style={{ width: "20%" }}>
                    <div className="pl-2">貨號</div>
                  </th>
                  <th style={{ width: "8%" }}>
                    <div className="pl-2">型態</div>
                  </th>
                  <th style={{ width: "13%" }}>
                    <div className="pl-2">數量</div>
                  </th>
                  <th style={{ width: "8%" }}>
                    <div className="pl-2">單位</div>
                  </th>
                  <th style={{ width: "17%" }}>
                    <div className="pl-1">出庫原因</div>
                  </th>
                  <th style={{ width: "13%" }}>開單人員</th>
                  <th style={{ width: "15%" }}>倉別</th>
                  <th style={{ width: "6%" }}></th>
                </tr>
              </thead>
              <tbody>
                {outStockListFiltered.map((object, index) => (
                  <SearchInfo
                    key={index}
                    searchInfo={object}
                    checked={
                      object.handled ? false : toBeSubmit[object.id].selected
                    }
                    onInfoCheckBoxChange={this.onInfoCheckBoxChange}
                    onInfoWHChange={this.onInfoWHChange}
                    cancelShip={this.props.cancelShip}
                    deleteOutStock={this.props.deleteOutStock}
                    initialize={this.props.initialize}
                  />
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
