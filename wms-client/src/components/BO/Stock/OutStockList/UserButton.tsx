import React, { useCallback, MouseEvent } from "react";

interface UserButtonProps {
  index: number;
  user: string;
  selected: boolean;
  handleUserSelection: (index: number) => void;
}

const UserButton: React.FC<UserButtonProps> = ({ index, user, selected, handleUserSelection }) => {
  const onClick = useCallback(
    (_e: MouseEvent<HTMLButtonElement>) => {
      handleUserSelection(index);
    },
    [handleUserSelection, index]
  );

  return (
    <button
      type="button"
      className={selected ? "btn btn-primary btn-sm" : "btn btn-outline-primary btn-sm"}
      aria-pressed={selected}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--spacing-1)",
        padding: "var(--spacing-1) var(--spacing-3)",
        borderRadius: "var(--border-radius-md)",
        fontWeight: "var(--font-weight-medium)",
        transition: "var(--transition-fast)",
        whiteSpace: "nowrap",
      }}
    >
      {selected && (
        <i className="fa fa-check" aria-hidden="true" style={{ fontSize: "0.7rem" }} />
      )}
      {user}
    </button>
  );
};

export default UserButton;
