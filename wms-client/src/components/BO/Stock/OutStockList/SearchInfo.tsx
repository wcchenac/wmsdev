import React, { Component, ChangeEvent, MouseEvent } from "react";
import InfoCheckBox from "./InfoCheckBox";
import DeleteIcon from "@mui/icons-material/Delete";
import GetAppIcon from "@mui/icons-material/GetApp";
import IconButton, { ActionButtonGroup } from "../../../UI/IconButton";

export interface OutStockInfo {
  id: number;
  productNo: string;
  type: string;
  quantity: number;
  unit: string;
  reason: string;
  createdBy: string;
  handled: boolean;
  outStockType: number;
  fileName: string;
  stockIdentifierId?: number;
}

interface SearchInfoProps {
  searchInfo: OutStockInfo;
  checked: boolean;
  onInfoCheckBoxChange: (checked: boolean, id: number) => void;
  onInfoWHChange: (value: string, id: number) => void;
  handleDeleteClick: (info: OutStockInfo) => void;
  handleModalShow: () => void;
  downloadFile: (e: { target: { name: string; value: string } }) => void;
  initialize: () => void;
}

class SearchInfo extends Component<SearchInfoProps> {
  constructor(props: SearchInfoProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onDownloadClick = this.onDownloadClick.bind(this);
  }

  onChange(e: ChangeEvent<HTMLSelectElement>): void {
    this.props.onInfoWHChange(e.target.value, this.props.searchInfo.id);
  }

  onDeleteClick(): void {
    this.props.handleDeleteClick(this.props.searchInfo);
  }

  onDownloadClick(_e: MouseEvent<HTMLButtonElement>): void {
    // Create synthetic event for download handler
    const syntheticEvent = {
      target: {
        name: "outStockList",
        value: this.props.searchInfo.fileName
      }
    };
    this.props.downloadFile(syntheticEvent);
  }

  render(): React.ReactNode {
    const { searchInfo } = this.props;
    const { handled, outStockType } = this.props.searchInfo;

    return (
      <tr
        className={handled ? "table-secondary" : ""}
        role="row"
        aria-label={`${searchInfo.productNo} ${handled ? "已處理" : "待處理"}`}
      >
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
          <span
            className="text-cell"
            style={{
              display: "block",
              padding: "var(--spacing-2)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-gray-800)"
            }}
          >
            {searchInfo.productNo}
          </span>
        </td>
        <td>
          <span
            className="text-cell"
            style={{
              display: "block",
              padding: "var(--spacing-2)"
            }}
          >
            {searchInfo.type}
          </span>
        </td>
        <td>
          <span
            className="text-cell"
            style={{
              display: "block",
              padding: "var(--spacing-2)",
              fontWeight: "var(--font-weight-medium)"
            }}
          >
            {searchInfo.quantity}
          </span>
        </td>
        <td>
          <span
            className="text-cell"
            style={{
              display: "block",
              padding: "var(--spacing-2)"
            }}
          >
            {searchInfo.unit}
          </span>
        </td>
        <td>
          <span
            className="text-cell"
            style={{
              display: "block",
              padding: "var(--spacing-2)",
              color: "var(--color-gray-600)"
            }}
          >
            {searchInfo.reason}
          </span>
        </td>
        <td>
          <span
            className="text-cell"
            style={{
              display: "block",
              padding: "var(--spacing-2)"
            }}
          >
            {searchInfo.createdBy}
          </span>
        </td>
        <td>
          {handled ? (
            <ActionButtonGroup align="center">
              <button
                type="button"
                className="btn btn-sm"
                onClick={this.onDownloadClick}
                aria-label={`下載 ${searchInfo.fileName.substring(13)}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--spacing-1)",
                  padding: "var(--spacing-1) var(--spacing-2)",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary-dark)",
                  border: "1px solid var(--color-primary)",
                  borderRadius: "var(--border-radius-base)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  cursor: "pointer",
                  transition: "var(--transition-fast)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-primary)";
                  e.currentTarget.style.color = "var(--color-white)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-primary-light)";
                  e.currentTarget.style.color = "var(--color-primary-dark)";
                }}
              >
                <GetAppIcon style={{ fontSize: "1rem" }} />
                <span>{searchInfo.fileName.substring(13)}</span>
              </button>
            </ActionButtonGroup>
          ) : (
            <select
              className="custom-select custom-select-sm"
              name="whName"
              defaultValue=""
              onChange={this.onChange}
              disabled={handled}
              aria-label="選擇倉別"
              style={{
                borderRadius: "var(--border-radius-base)",
                fontSize: "var(--font-size-sm)"
              }}
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
            <ActionButtonGroup align="center">
              <IconButton
                icon={<DeleteIcon />}
                onClick={this.onDeleteClick}
                label={handled ? "刪除此筆記錄" : "取消出貨"}
                tooltip={handled ? "刪除此筆記錄" : "取消出貨"}
                variant="danger"
                size="sm"
              />
            </ActionButtonGroup>
          )}
        </td>
      </tr>
    );
  }
}

export default SearchInfo;
