import React, { useCallback } from "react";
import UserButton from "./UserButton";
import { SelectedUser } from "../../../../types";

interface UserSelectionProps {
  selectedUserList: SelectedUser[];
  handleSelectAll: () => void;
  handleUnselectAll: () => void;
  handleUserSelection: (index: number) => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({
  selectedUserList,
  handleSelectAll,
  handleUnselectAll,
  handleUserSelection
}) => {
  const buttonAllAlgorithm = useCallback((userList: SelectedUser[]): boolean => {
    let isSelected = true;

    for (let i = 0; i < userList.length; i += 1) {
      if (userList[i].selected) {
        isSelected = true;
      } else {
        isSelected = false;
        break;
      }
    }

    return isSelected;
  }, []);

  const buttonAllUnAlgorithm = useCallback((userList: SelectedUser[]): boolean => {
    let isSelected = false;

    for (let i = 0; i < userList.length; i += 1) {
      if (userList[i].selected) {
        isSelected = false;
        break;
      } else {
        isSelected = true;
      }
    }

    return isSelected;
  }, []);

  const isAllSelected = buttonAllAlgorithm(selectedUserList);
  const isAllUnselected = buttonAllUnAlgorithm(selectedUserList);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "var(--spacing-2)",
      }}
    >
      {/* Control Buttons Group */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--spacing-2)",
          paddingRight: "var(--spacing-3)",
          borderRight: "1px solid var(--color-gray-200)",
          marginRight: "var(--spacing-2)",
        }}
      >
        <span
          style={{
            color: "var(--color-gray-600)",
            fontWeight: "var(--font-weight-medium)",
            fontSize: "var(--font-size-sm)",
            whiteSpace: "nowrap",
          }}
        >
          開單者篩選:
        </span>
        <button
          type="button"
          className={isAllSelected ? "btn btn-info btn-sm" : "btn btn-outline-info btn-sm"}
          onClick={handleSelectAll}
          aria-pressed={isAllSelected}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--spacing-1)",
            padding: "var(--spacing-1) var(--spacing-3)",
            borderRadius: "var(--border-radius-md)",
            fontWeight: "var(--font-weight-medium)",
            transition: "var(--transition-fast)",
          }}
        >
          <i className="fa fa-check-square-o" aria-hidden="true" style={{ fontSize: "0.75rem" }} />
          全選
        </button>
        <button
          type="button"
          className={isAllUnselected ? "btn btn-secondary btn-sm" : "btn btn-outline-secondary btn-sm"}
          onClick={handleUnselectAll}
          aria-pressed={isAllUnselected}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--spacing-1)",
            padding: "var(--spacing-1) var(--spacing-3)",
            borderRadius: "var(--border-radius-md)",
            fontWeight: "var(--font-weight-medium)",
            transition: "var(--transition-fast)",
          }}
        >
          <i className="fa fa-times" aria-hidden="true" style={{ fontSize: "0.75rem" }} />
          全不選
        </button>
      </div>

      {/* User Buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--spacing-2)",
          alignItems: "center",
        }}
      >
        {selectedUserList.map((user, index) => (
          <UserButton
            key={index}
            index={index}
            user={user.user}
            selected={user.selected}
            handleUserSelection={handleUserSelection}
          />
        ))}
      </div>
    </div>
  );
};

export default UserSelection;
