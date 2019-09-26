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

  render() {
    const { clothInfo } = this.props;
    const { clothIdentifier } = this.props.clothInfo;

    const btnAlgorithm = type => {
      if (type === "整支") {
        return (
          <div>
            <div
              className="btn-group mr-2"
              role="group"
              aria-label="First group"
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.onTypeExchangeClick}
              >
                板卷異動
              </button>
            </div>
            <div
              className="btn-group mr-2"
              role="group"
              aria-label="Second group"
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.onSameTypeClick}
              >
                整支異動
              </button>
            </div>
          </div>
        );
      }
      if (type === "板卷") {
        return (
          <div className="btn-group mr-2" role="group" aria-label="First group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onTypeExchangeClick}
            >
              板卷異動
            </button>
          </div>
        );
      }
    };

    let btnContent;
    btnContent = btnAlgorithm(clothIdentifier.type);

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
        <td>
          <div
            className="btn-toolbar"
            role="toolbar"
            aria-label="Toolbar with button groups"
          >
            {btnContent}
            <div
              className="btn-group mr-2"
              role="group"
              aria-label="Third group"
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.onCancelShrinkClick}
              >
                取消減肥
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }
}

export default ShrinkInfo;
