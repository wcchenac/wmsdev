import React, { Component } from "react";

class CheckBox extends Component {
  constructor(props) {
    super(props);
    this.handleChecked = this.handleChecked.bind(this);
  }

  handleChecked(e) {
    this.props.handleCheckBoxSelected(e, this.props.index);
  }

  render() {
    const { productNo, index } = this.props;

    return (
      <div className="card w-50">
        <div className="card-body">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id={"checkbox" + index}
              value={productNo}
              onChange={this.handleChecked}
            />
            <label className="form-check-label" htmlFor={"checkbox" + index}>
              {productNo}
            </label>
          </div>
        </div>
      </div>
    );
  }
}

export default CheckBox;
