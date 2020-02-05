import React, { PureComponent } from "react";

class HeaderCheckBox extends PureComponent {
  constructor(props) {
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
