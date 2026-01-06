import React, { memo, useCallback, ChangeEvent } from "react";

interface HeaderCheckBoxProps {
  checked: boolean;
  onHeaderCheckBoxChange: (checked: boolean) => void;
}

const HeaderCheckBox = memo<HeaderCheckBoxProps>(({ checked, onHeaderCheckBoxChange }) => {
  const onChange = useCallback(
    (_e: ChangeEvent<HTMLInputElement>) => {
      onHeaderCheckBoxChange(checked);
    },
    [onHeaderCheckBoxChange, checked]
  );

  return (
    <input
      type="checkbox"
      name="header-checkbox"
      checked={checked}
      onChange={onChange}
    />
  );
});

HeaderCheckBox.displayName = "HeaderCheckBox";

export default HeaderCheckBox;
