import React, { ReactNode, MouseEvent, KeyboardEvent } from "react";

/**
 * IconButton variant types
 */
export type IconButtonVariant = "default" | "primary" | "danger" | "success" | "warning" | "info";

/**
 * IconButton size types
 */
export type IconButtonSize = "sm" | "md" | "lg";

/**
 * IconButton Component Props
 */
export interface IconButtonProps {
  icon: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => void;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  className?: string;
}

interface VariantStyle {
  color: string;
  hoverColor: string;
  hoverBg: string;
}

interface SizeStyle {
  padding: string;
  fontSize: string;
  minWidth: string;
  minHeight: string;
}

/**
 * IconButton - Accessible icon button for actions
 * Provides consistent styling, tooltips, and accessibility for icon-based actions
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  label,
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  tooltip,
  className
}) => {
  const variantStyles: Record<IconButtonVariant, VariantStyle> = {
    default: {
      color: "var(--color-gray-600)",
      hoverColor: "var(--color-gray-800)",
      hoverBg: "var(--color-gray-100)"
    },
    primary: {
      color: "var(--color-primary)",
      hoverColor: "var(--color-primary-dark)",
      hoverBg: "var(--color-primary-light)"
    },
    danger: {
      color: "var(--color-danger)",
      hoverColor: "var(--color-danger-dark)",
      hoverBg: "var(--color-danger-light)"
    },
    success: {
      color: "var(--color-success)",
      hoverColor: "var(--color-success-dark)",
      hoverBg: "var(--color-success-light)"
    },
    warning: {
      color: "var(--color-warning-dark)",
      hoverColor: "var(--color-warning-dark)",
      hoverBg: "var(--color-warning-light)"
    },
    info: {
      color: "var(--color-info)",
      hoverColor: "var(--color-info-dark)",
      hoverBg: "var(--color-info-light)"
    }
  };

  const sizeStyles: Record<IconButtonSize, SizeStyle> = {
    sm: {
      padding: "var(--spacing-1)",
      fontSize: "1rem",
      minWidth: "28px",
      minHeight: "28px"
    },
    md: {
      padding: "var(--spacing-2)",
      fontSize: "1.25rem",
      minWidth: "36px",
      minHeight: "36px"
    },
    lg: {
      padding: "var(--spacing-3)",
      fontSize: "1.5rem",
      minWidth: "44px",
      minHeight: "44px"
    }
  };

  const config = variantStyles[variant] || variantStyles.default;
  const sizeConfig = sizeStyles[size] || sizeStyles.md;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled && !loading && onClick) {
        onClick(e);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={label}
      aria-busy={loading}
      title={tooltip || label}
      className={`icon-button ${className || ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: sizeConfig.padding,
        minWidth: sizeConfig.minWidth,
        minHeight: sizeConfig.minHeight,
        border: "none",
        borderRadius: "var(--border-radius-base)",
        backgroundColor: "transparent",
        color: disabled ? "var(--color-gray-400)" : config.color,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        transition: "var(--transition-fast)",
        opacity: disabled ? 0.6 : 1,
        outline: "none"
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = config.hoverBg;
          e.currentTarget.style.color = config.hoverColor;
          e.currentTarget.style.transform = "scale(1.1)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = disabled ? "var(--color-gray-400)" : config.color;
        e.currentTarget.style.transform = "scale(1)";
      }}
      onFocus={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${config.hoverBg}`;
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {loading ? (
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
          style={{ width: sizeConfig.fontSize, height: sizeConfig.fontSize }}
        />
      ) : (
        <span style={{ display: "flex", fontSize: sizeConfig.fontSize }}>
          {icon}
        </span>
      )}
    </button>
  );
};

/**
 * ActionButtonGroup alignment types
 */
export type ActionButtonGroupAlign = "start" | "center" | "end";

/**
 * ActionButtonGroup gap types
 */
export type ActionButtonGroupGap = "sm" | "md" | "lg";

/**
 * ActionButtonGroup Component Props
 */
export interface ActionButtonGroupProps {
  children: ReactNode;
  align?: ActionButtonGroupAlign;
  gap?: ActionButtonGroupGap;
}

/**
 * ActionButtonGroup - Container for grouping action buttons
 */
export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  children,
  align = "center",
  gap = "sm"
}) => {
  const gapStyles: Record<ActionButtonGroupGap, string> = {
    sm: "var(--spacing-1)",
    md: "var(--spacing-2)",
    lg: "var(--spacing-3)"
  };

  return (
    <div
      className="action-button-group"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: align === "center" ? "center" : align === "end" ? "flex-end" : "flex-start",
        gap: gapStyles[gap] || gapStyles.sm
      }}
    >
      {children}
    </div>
  );
};

export default IconButton;
