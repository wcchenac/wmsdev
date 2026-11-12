import React, { Component } from "react";
import UserButton from "./UserButton";

export interface SelectedUser {
  user: string;
  selected: boolean;
}

interface Props {
  selectedUserList: SelectedUser[];
  handleSelectAll: () => void;
  handleUnselectAll: () => void;
  handleUserSelection: (index: number) => void;
}

class UserSelection extends Component<Props> {
  buttonAllAlgorithm = (selectedUserList: SelectedUser[]) => {
    let isSelecteded = true;

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

  buttonAllUnAlgorithm = (selectedUserList: SelectedUser[]) => {
    let isSelecteded = false;

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
    const isAllSelected = this.buttonAllAlgorithm(selectedUserList);
    const isAllUnselected = this.buttonAllUnAlgorithm(selectedUserList);
    const classNameForAll = isAllSelected
      ? "btn btn-outline-info mr-2 active"
      : "btn btn-outline-info mr-2";
    const classNameForAllUn = isAllUnselected
      ? "btn btn-outline-info mr-2 active"
      : "btn btn-outline-info mr-2";

    return (
      <div className="row">
        <button className="btn-customize" disabled>
          開單者篩選:
        </button>
        <button
          className={classNameForAll}
          data-toggle="button"
          aria-pressed="false"
          onClick={this.props.handleSelectAll}
          {...({
            tyep: "button",
            autoComplete: "off",
          } as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          全選
        </button>
        <button
          type="button"
          className={classNameForAllUn}
          data-toggle="button"
          aria-pressed="false"
          onClick={this.props.handleUnselectAll}
          {...({
            autoComplete: "off",
          } as React.ButtonHTMLAttributes<HTMLButtonElement>)}
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
