import React, { PureComponent } from "react";

class InfoCheckBox extends PureComponent {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    this.props.onInfoCheckBoxChange(this.props.checked, this.props.id);
  }

  render() {
    return (
      <input
        type="checkbox"
        name="info-checkbox"
        checked={this.props.checked}
        disabled={this.props.disable}
        onChange={this.onChange}
      />
    );
  }
}

export default InfoCheckBox;
