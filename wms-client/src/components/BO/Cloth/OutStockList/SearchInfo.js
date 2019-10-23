import React, { Component } from "react";
import InfoCheckBox from "./InfoCheckBox";

class SearchInfo extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.onInfoWHChange(e.target.value, this.props.searchInfo.id);
  }

  render() {
    const { handled } = this.props.searchInfo;

    return (
      <React.Fragment>
        <tr className={handled ? "table-secondary" : ""}>
          <td>
            <div className="pt-1">
              <InfoCheckBox
                id={this.props.searchInfo.id}
                disable={handled}
                checked={this.props.checked}
                onInfoCheckBoxChange={this.props.onInfoCheckBoxChange}
              />
            </div>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {this.props.searchInfo.productNo}
            </button>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {this.props.searchInfo.type}
            </button>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {this.props.searchInfo.length}
            </button>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {this.props.searchInfo.unit}
            </button>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {this.props.searchInfo.reason}
            </button>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {this.props.searchInfo.createdBy}
            </button>
          </td>
          <td>
            <select
              className="custom-select"
              name="whName"
              defaultValue=""
              onChange={this.onChange}
              disabled={handled}
            >
              <option value="">請選擇...</option>
              <option value="內倉">內倉</option>
              <option value="外倉">外倉</option>
              <option value="業外">業外</option>
              <option value="業內">業內</option>
            </select>
          </td>
        </tr>
      </React.Fragment>
    );
  }
}

export default SearchInfo;
