import React, { Component } from "react";

interface Props {
  index: number;
  user: string;
  selected: boolean;
  handleUserSelection: (index: number) => void;
}

class UserButton extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.handleUserSelection(this.props.index);
  }

  render() {
    const { selected } = this.props;

    return (
      <button
        type="button"
        className={
          selected
            ? "btn btn-outline-info mr-2 active"
            : "btn btn-outline-info mr-2"
        }
        data-toggle="button"
        aria-pressed={selected}
        onClick={this.onClick}
        {...({
          autoComplete: "off",
        } as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {this.props.user}
      </button>
    );
  }
}

export default UserButton;
