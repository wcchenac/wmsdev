import React, { Component } from "react";
import UserButton from "./UserButton";

class UserSelection extends Component {
  constructor(props) {
    super(props);
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.handleUnselectAll = this.handleUnselectAll.bind(this);
  }

  handleSelectAll() {
    this.props.handleSelectAll();
  }

  handleUnselectAll() {
    this.props.handleUnselectAll();
  }

  buttonAllAlgorithm = selectedUserList => {
    var isSelecteded = true;

    for (let i = 0; i < selectedUserList.length; i += 1) {
      if (selectedUserList[i].selected) {
        isSelecteded = true;
      } else {
        isSelecteded = false;
        break;
      }
    }

    return isSelecteded;
  };

  buttonAllUnAlgorithm = selectedUserList => {
    var isSelecteded = false;

    for (let i = 0; i < selectedUserList.length; i += 1) {
      if (selectedUserList[i].selected) {
        isSelecteded = false;
        break;
      } else {
        isSelecteded = true;
      }
    }

    return isSelecteded;
  };

  render() {
    const { selectedUserList } = this.props;
    let isAllSelected = this.buttonAllAlgorithm(selectedUserList);
    let isAllUnselected = this.buttonAllUnAlgorithm(selectedUserList);
    let classNameForAll = isAllSelected
      ? "btn btn-outline-info mr-2 active"
      : "btn btn-outline-info mr-2";
    let classNameForAllUn = isAllUnselected
      ? "btn btn-outline-info mr-2 active"
      : "btn btn-outline-info mr-2";

    return (
      <div className="row">
        <button className="btn-customize" disabled>
          開單者篩選功能:
        </button>
        <button
          tyep="button"
          className={classNameForAll}
          data-toggle="button"
          aria-pressed="false"
          autoComplete="off"
          onClick={this.handleSelectAll}
        >
          全選
        </button>
        <button
          type="button"
          className={classNameForAllUn}
          data-toggle="button"
          aria-pressed="false"
          autoComplete="off"
          onClick={this.handleUnselectAll}
        >
          全不選
        </button>
        <button className="btn-customize" disabled></button>
        {selectedUserList.map((user, index) => (
          <UserButton
            key={index}
            index={index}
            user={user.user}
            selected={user.selected}
            handleUserSelection={this.props.handleUserSelection}
          />
        ))}
      </div>
    );
  }
}

export default UserSelection;
