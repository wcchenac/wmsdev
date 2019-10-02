import React, { Component } from "react";

class ShrinkInfo extends Component {
  constructor(props) {
    super(props);
    this.onTypeExchangeClick = this.onTypeExchangeClick.bind(this);
    this.onSameTypeClick = this.onSameTypeClick.bind(this);
    this.onCancelShrinkClick = this.onCancelShrinkClick.bind(this);
  }

  onTypeExchangeClick() {
    this.props.onTypeExchangeClick(this.props.clothInfo);
  }

  onSameTypeClick() {
    this.props.onSameTypeClick(this.props.clothInfo);
  }

  onCancelShrinkClick() {
    this.props.onCancelShrinkClick(this.props.clothInfo.clothIdentifier.id);
  }

  btnAlgorithm(type) {
    if (type === "整支") {
      return (
        <React.Fragment>
          <td>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onTypeExchangeClick}
            >
              板卷異動
            </button>
          </td>
          <td>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onSameTypeClick}
            >
              整支異動
            </button>
          </td>
        </React.Fragment>
      );
    }
    if (type === "板卷") {
      return (
        <React.Fragment>
          <td>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onTypeExchangeClick}
            >
              板卷異動
            </button>
          </td>
          <td></td>
        </React.Fragment>
      );
    }
  }

  render() {
    const { clothInfo } = this.props;
    const { clothIdentifier } = this.props.clothInfo;
    let btnContent = this.btnAlgorithm(clothIdentifier.type);

    return (
      <tr>
        <td>
          <button className="btn-customize" disabled>
            {clothIdentifier.productNo}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothIdentifier.lotNo}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothIdentifier.type}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothIdentifier.length}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothIdentifier.unit}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothInfo.color}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothInfo.defect}
          </button>
        </td>
        {btnContent}
        <td>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.onCancelShrinkClick}
          >
            取消減肥
          </button>
        </td>
      </tr>
    );
  }
}

export default ShrinkInfo;
