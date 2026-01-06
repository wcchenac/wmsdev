import React, { memo, useCallback, ChangeEvent } from "react";

interface InfoCheckBoxProps {
  checked: boolean;
  disable: boolean;
  id: number;
  onInfoCheckBoxChange: (checked: boolean, id: number) => void;
}

const InfoCheckBox = memo<InfoCheckBoxProps>(({ checked, disable, id, onInfoCheckBoxChange }) => {
  const onChange = useCallback(
    (_e: ChangeEvent<HTMLInputElement>) => {
      onInfoCheckBoxChange(checked, id);
    },
    [onInfoCheckBoxChange, checked, id]
  );

  return (
    <input
      type="checkbox"
      name="info-checkbox"
      checked={checked}
      disabled={disable}
      onChange={onChange}
    />
  );
});

InfoCheckBox.displayName = "InfoCheckBox";

export default InfoCheckBox;
