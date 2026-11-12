import React, { Component } from "react";
import InfoCheckBox from "./InfoCheckBox";

import type { OutStockRequestRecord } from "../../../../types/domain";

interface Props {
  searchInfo: OutStockRequestRecord;
  checked: boolean;
  onInfoWHChange: (value: string, id: number) => void;
  handleDeleteClick: (searchInfo: OutStockRequestRecord) => void;
  onInfoCheckBoxChange: (checked: boolean, id: number) => void;
  downloadFile: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleModalShow?: () => void;
  initialize?: () => void;
}


class SearchInfo extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.props.onInfoWHChange(e.target.value, this.props.searchInfo.id);
  }

  onDeleteClick() {
    this.props.handleDeleteClick(this.props.searchInfo);
  }

  render() {
    const { searchInfo } = this.props;
    const { handled, outStockType } = this.props.searchInfo;

    return (
      <React.Fragment>
        <tr className={handled ? "table-secondary" : ""}>
          <td>
            <div className="pt-1">
              <InfoCheckBox
                id={searchInfo.id}
                disable={handled}
                checked={this.props.checked}
                onInfoCheckBoxChange={this.props.onInfoCheckBoxChange}
              />
            </div>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {searchInfo.productNo}
            </button>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {searchInfo.type}
            </button>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {searchInfo.quantity}
            </button>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {searchInfo.unit}
            </button>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {searchInfo.reason}
            </button>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {searchInfo.createdBy}
            </button>
          </td>
          <td>
            {handled ? (
              <div className="row justify-content-center">
                <button
                  className="btn btn-primary"
                  name="outStockList"
                  value={searchInfo.fileName}
                  onClick={this.props.downloadFile}
                >
                  {(searchInfo.fileName ?? "").substring(13)}
                </button>
              </div>
            ) : (
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
                <option value="雜項">雜項</option>
              </select>
            )}
          </td>
          <td>
            {outStockType === 1 ? null : (
              <i
                className="fa fa-trash fa-lg pt-2"
                aria-hidden="true"
                onClick={this.onDeleteClick}
              ></i>
            )}
          </td>
        </tr>
      </React.Fragment>
    );
  }
}

export default SearchInfo;
