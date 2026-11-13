import React, { PureComponent } from "react";

interface Props {
  checked: boolean;
  onHeaderCheckBoxChange: (checked: boolean) => void;
}

class HeaderCheckBox extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    this.props.onHeaderCheckBoxChange(this.props.checked);
  }

  render() {
    return (
      <input
        type="checkbox"
        name="header-checkbox"
        checked={this.props.checked}
        onChange={this.onChange}
      />
    );
  }
}

export default HeaderCheckBox;
