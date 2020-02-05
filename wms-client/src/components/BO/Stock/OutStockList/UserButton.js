import React, { Component } from "react";

class UserButton extends Component {
  constructor(props) {
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
        autoComplete="off"
        onClick={this.onClick}
      >
        {this.props.user}
      </button>
    );
  }
}

export default UserButton;
