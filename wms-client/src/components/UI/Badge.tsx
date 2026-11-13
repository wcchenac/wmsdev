import React, { ReactNode, CSSProperties } from "react";

/**
 * Badge variant types
 */
export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "solid-primary"
  | "solid-success"
  | "solid-danger"
  | "solid-warning"
  | "solid-info";

/**
 * Badge size types
 */
export type BadgeSize = "sm" | "md" | "lg";

/**
 * Badge Component Props
 */
export interface BadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
}

/**
 * Badge - Status indicator component
 * Used to display status, counts, or labels
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  pill = false,
  dot = false,
  icon,
  className
}) => {
  const variantStyles: Record<BadgeVariant, CSSProperties> = {
    default: {
      backgroundColor: "var(--color-gray-200)",
      color: "var(--color-gray-700)"
    },
    primary: {
      backgroundColor: "var(--color-primary-light)",
      color: "var(--color-primary-dark)"
    },
    secondary: {
      backgroundColor: "var(--color-secondary-light)",
      color: "var(--color-secondary-dark)"
    },
    success: {
      backgroundColor: "var(--color-success-light)",
      color: "var(--color-success-dark)"
    },
    danger: {
      backgroundColor: "var(--color-danger-light)",
      color: "var(--color-danger-dark)"
    },
    warning: {
      backgroundColor: "var(--color-warning-light)",
      color: "var(--color-warning-dark)"
    },
    info: {
      backgroundColor: "var(--color-info-light)",
      color: "var(--color-info-dark)"
    },
    // Solid variants
    "solid-primary": {
      backgroundColor: "var(--color-primary)",
      color: "var(--color-white)"
    },
    "solid-success": {
      backgroundColor: "var(--color-success)",
      color: "var(--color-white)"
    },
    "solid-danger": {
      backgroundColor: "var(--color-danger)",
      color: "var(--color-white)"
    },
    "solid-warning": {
      backgroundColor: "var(--color-warning)",
      color: "var(--color-gray-900)"
    },
    "solid-info": {
      backgroundColor: "var(--color-info)",
      color: "var(--color-white)"
    }
  };

  const sizeStyles: Record<BadgeSize, CSSProperties> = {
    sm: {
      fontSize: "var(--font-size-xs)",
      padding: dot ? "0" : "var(--spacing-1) var(--spacing-2)",
      minWidth: dot ? "8px" : "auto",
      height: dot ? "8px" : "auto"
    },
    md: {
      fontSize: "var(--font-size-sm)",
      padding: dot ? "0" : "var(--spacing-1) var(--spacing-3)",
      minWidth: dot ? "10px" : "auto",
      height: dot ? "10px" : "auto"
    },
    lg: {
      fontSize: "var(--font-size-base)",
      padding: dot ? "0" : "var(--spacing-2) var(--spacing-4)",
      minWidth: dot ? "12px" : "auto",
      height: dot ? "12px" : "auto"
    }
  };

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--spacing-1)",
    fontWeight: "var(--font-weight-medium)",
    borderRadius: pill || dot ? "var(--border-radius-full)" : "var(--border-radius-sm)",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    ...variantStyles[variant],
    ...sizeStyles[size]
  };

  if (dot) {
    return (
      <span
        className={`badge badge-dot ${className || ""}`}
        style={style}
        role="status"
        aria-label={typeof children === "string" ? children : "Status indicator"}
      />
    );
  }

  return (
    <span
      className={`badge ${className || ""}`}
      style={style}
    >
      {icon && (
        <span style={{ display: "flex", alignItems: "center" }}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

/**
 * Status types for StatusBadge
 */
export type StatusType =
  | "inStock"
  | "outOfStock"
  | "lowStock"
  | "reserved"
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "shipped"
  | "active"
  | "inactive"
  | "enabled"
  | "disabled"
  | "new"
  | "updated"
  | "deleted";

/**
 * StatusBadge Component Props
 */
export interface StatusBadgeProps {
  status: StatusType | string;
  size?: BadgeSize;
}

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

/**
 * StatusBadge - Pre-configured status indicator
 * Common statuses used in the application
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const statusConfig: Record<StatusType, StatusConfig> = {
    // Stock statuses
    inStock: { label: "有庫存", variant: "success" },
    outOfStock: { label: "無庫存", variant: "danger" },
    lowStock: { label: "庫存不足", variant: "warning" },
    reserved: { label: "已預留", variant: "info" },

    // Order statuses
    pending: { label: "待處理", variant: "warning" },
    processing: { label: "處理中", variant: "info" },
    completed: { label: "已完成", variant: "success" },
    cancelled: { label: "已取消", variant: "danger" },
    shipped: { label: "已出貨", variant: "success" },

    // General statuses
    active: { label: "啟用", variant: "success" },
    inactive: { label: "停用", variant: "default" },
    enabled: { label: "啟用", variant: "success" },
    disabled: { label: "停用", variant: "default" },
    new: { label: "新增", variant: "primary" },
    updated: { label: "已更新", variant: "info" },
    deleted: { label: "已刪除", variant: "danger" }
  };

  const config = statusConfig[status as StatusType] || { label: status, variant: "default" as BadgeVariant };

  return (
    <Badge variant={config.variant} size={size} pill>
      {config.label}
    </Badge>
  );
};

export default Badge;
