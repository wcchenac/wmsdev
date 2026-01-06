import React, { useState, useEffect, ReactNode, MouseEvent } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Alert variant types
 */
export type AlertVariant = "success" | "error" | "warning" | "info";

/**
 * Alert Component Props
 */
export interface AlertProps {
  children?: ReactNode;
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  autoClose?: number;
  showIcon?: boolean;
  className?: string;
}

interface VariantConfig {
  icon: ReactNode;
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
}

/**
 * Alert - Feedback alert component
 * Displays success, error, warning, or info messages
 */
const Alert: React.FC<AlertProps> = ({
  children,
  variant = "info",
  title,
  dismissible = false,
  onDismiss,
  autoClose = 0,
  showIcon = true,
  className
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible) return null;

  const variantConfig: Record<AlertVariant, VariantConfig> = {
    success: {
      icon: <CheckCircleIcon />,
      backgroundColor: "var(--color-success-light)",
      borderColor: "var(--color-success)",
      iconColor: "var(--color-success)",
      textColor: "var(--color-success-dark)"
    },
    error: {
      icon: <ErrorIcon />,
      backgroundColor: "var(--color-danger-light)",
      borderColor: "var(--color-danger)",
      iconColor: "var(--color-danger)",
      textColor: "var(--color-danger-dark)"
    },
    warning: {
      icon: <WarningIcon />,
      backgroundColor: "var(--color-warning-light)",
      borderColor: "var(--color-warning)",
      iconColor: "var(--color-warning-dark)",
      textColor: "var(--color-warning-dark)"
    },
    info: {
      icon: <InfoIcon />,
      backgroundColor: "var(--color-info-light)",
      borderColor: "var(--color-info)",
      iconColor: "var(--color-info)",
      textColor: "var(--color-info-dark)"
    }
  };

  const config = variantConfig[variant] || variantConfig.info;

  return (
    <div
      className={`alert-component fade-in ${className || ""}`}
      role="alert"
      aria-live={variant === "error" ? "assertive" : "polite"}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--spacing-3)",
        padding: "var(--spacing-3) var(--spacing-4)",
        backgroundColor: config.backgroundColor,
        borderLeft: `4px solid ${config.borderColor}`,
        borderRadius: "var(--border-radius-md)",
        marginBottom: "var(--spacing-4)"
      }}
    >
      {showIcon && (
        <span
          style={{
            color: config.iconColor,
            flexShrink: 0,
            marginTop: "2px"
          }}
        >
          {config.icon}
        </span>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <h6
            style={{
              fontWeight: "var(--font-weight-semibold)",
              color: config.textColor,
              marginBottom: children ? "var(--spacing-1)" : 0,
              fontSize: "var(--font-size-base)"
            }}
          >
            {title}
          </h6>
        )}
        {children && (
          <div
            style={{
              color: config.textColor,
              fontSize: "var(--font-size-sm)",
              lineHeight: "var(--line-height-relaxed)"
            }}
          >
            {children}
          </div>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close message"
          style={{
            background: "none",
            border: "none",
            padding: "var(--spacing-1)",
            cursor: "pointer",
            color: config.textColor,
            opacity: 0.7,
            transition: "var(--transition-fast)",
            flexShrink: 0
          }}
          onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.opacity = "1")}
          onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.opacity = "0.7")}
        >
          <CloseIcon style={{ fontSize: "1.2rem" }} />
        </button>
      )}
    </div>
  );
};

/**
 * InlineMessage variant types
 */
export type InlineMessageVariant = "success" | "error" | "warning" | "info";

/**
 * InlineMessage Component Props
 */
export interface InlineMessageProps {
  children: ReactNode;
  variant?: InlineMessageVariant;
  icon?: ReactNode;
}

interface InlineVariantConfig {
  color: string;
  defaultIcon: ReactNode;
}

/**
 * InlineMessage - Compact inline feedback message
 * For form field errors or small notifications
 */
export const InlineMessage: React.FC<InlineMessageProps> = ({
  children,
  variant = "error",
  icon
}) => {
  const variantConfig: Record<InlineMessageVariant, InlineVariantConfig> = {
    success: { color: "var(--color-success)", defaultIcon: <CheckCircleIcon /> },
    error: { color: "var(--color-danger)", defaultIcon: <ErrorIcon /> },
    warning: { color: "var(--color-warning-dark)", defaultIcon: <WarningIcon /> },
    info: { color: "var(--color-info)", defaultIcon: <InfoIcon /> }
  };

  const config = variantConfig[variant] || variantConfig.error;

  return (
    <span
      className="inline-message"
      role={variant === "error" ? "alert" : "status"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--spacing-1)",
        color: config.color,
        fontSize: "var(--font-size-sm)"
      }}
    >
      {(icon || config.defaultIcon) && (
        <span style={{ display: "flex", fontSize: "1rem" }}>
          {icon || React.cloneElement(config.defaultIcon as React.ReactElement<{ style?: React.CSSProperties }>, { style: { fontSize: "inherit" } })}
        </span>
      )}
      {children}
    </span>
  );
};

export default Alert;
