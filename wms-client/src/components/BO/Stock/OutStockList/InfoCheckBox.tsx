import React, { PureComponent } from "react";

interface Props {
  checked: boolean;
  disable?: boolean;
  id: number;
  onInfoCheckBoxChange: (checked: boolean, id: number) => void;
}

class InfoCheckBox extends PureComponent<Props> {
  constructor(props: Props) {
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
