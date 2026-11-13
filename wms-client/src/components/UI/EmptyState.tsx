import React, { ReactNode } from "react";
import SearchIcon from "@mui/icons-material/Search";
import InboxIcon from "@mui/icons-material/Inbox";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

/**
 * EmptyState type options
 */
export type EmptyStateType = "default" | "search" | "error" | "file";

/**
 * EmptyState Component Props
 */
export interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

/**
 * EmptyState Component
 * Displays a placeholder when there's no data to show
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  type = "default",
  icon,
  title,
  description,
  action,
  compact = false
}) => {
  const defaultIcons: Record<EmptyStateType, ReactNode> = {
    default: <InboxIcon />,
    search: <SearchIcon />,
    error: <ErrorOutlineIcon />,
    file: <InsertDriveFileIcon />
  };

  const defaultTitles: Record<EmptyStateType, string> = {
    default: "尚無資料",
    search: "找不到結果",
    error: "發生錯誤",
    file: "尚無檔案"
  };

  const defaultDescriptions: Record<EmptyStateType, string> = {
    default: "目前沒有可顯示的資料",
    search: "請嘗試其他搜尋條件",
    error: "無法載入資料，請稍後再試",
    file: "尚未上傳任何檔案"
  };

  const IconComponent = icon || defaultIcons[type];
  const displayTitle = title || defaultTitles[type];
  const displayDescription = description || defaultDescriptions[type];

  return (
    <div
      className="empty-state fade-in"
      role="status"
      aria-label={displayTitle}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: compact ? "var(--spacing-6) var(--spacing-4)" : "var(--spacing-12) var(--spacing-4)",
        color: "var(--color-gray-500)"
      }}
    >
      <div
        className="empty-state-icon"
        style={{
          fontSize: compact ? "2.5rem" : "4rem",
          marginBottom: compact ? "var(--spacing-2)" : "var(--spacing-4)",
          opacity: 0.5,
          color: "var(--color-gray-400)"
        }}
      >
        {IconComponent}
      </div>
      <h3
        className="empty-state-title"
        style={{
          fontSize: compact ? "var(--font-size-base)" : "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--color-gray-700)",
          marginBottom: "var(--spacing-2)",
          margin: 0
        }}
      >
        {displayTitle}
      </h3>
      {displayDescription && (
        <p
          className="empty-state-description"
          style={{
            fontSize: "var(--font-size-base)",
            color: "var(--color-gray-500)",
            marginBottom: action ? "var(--spacing-4)" : 0,
            maxWidth: "400px",
            margin: action ? "var(--spacing-2) 0 var(--spacing-4)" : "var(--spacing-2) 0 0"
          }}
        >
          {displayDescription}
        </p>
      )}
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
