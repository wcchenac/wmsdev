import React, { ReactNode, KeyboardEvent } from "react";
import { Modal, Button } from "react-bootstrap";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/**
 * ConfirmDialog variant types
 */
export type ConfirmDialogVariant = "warning" | "danger" | "info" | "question" | "success";

/**
 * ConfirmDialog Component Props
 */
export interface ConfirmDialogProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  showIcon?: boolean;
  children?: ReactNode;
}

interface VariantConfig {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  confirmVariant: string;
}

/**
 * ConfirmDialog - Reusable confirmation dialog component
 * Provides consistent confirmation UI across the application
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  onHide,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  loading = false,
  showIcon = true,
  children
}) => {
  const variantConfig: Record<ConfirmDialogVariant, VariantConfig> = {
    warning: {
      icon: <WarningIcon />,
      iconBg: "var(--color-warning-light)",
      iconColor: "var(--color-warning-dark)",
      confirmVariant: "warning"
    },
    danger: {
      icon: <ErrorIcon />,
      iconBg: "var(--color-danger-light)",
      iconColor: "var(--color-danger)",
      confirmVariant: "danger"
    },
    info: {
      icon: <InfoIcon />,
      iconBg: "var(--color-info-light)",
      iconColor: "var(--color-info-dark)",
      confirmVariant: "info"
    },
    question: {
      icon: <HelpIcon />,
      iconBg: "var(--color-primary-light)",
      iconColor: "var(--color-primary)",
      confirmVariant: "primary"
    },
    success: {
      icon: <CheckCircleIcon />,
      iconBg: "var(--color-success-light)",
      iconColor: "var(--color-success)",
      confirmVariant: "success"
    }
  };

  const config = variantConfig[variant] || variantConfig.warning;

  const handleConfirm = () => {
    if (!loading && onConfirm) {
      onConfirm();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !loading) {
      handleConfirm();
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="sm"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      backdrop="static"
      keyboard={!loading}
      onKeyDown={handleKeyDown}
    >
      <Modal.Body
        style={{
          padding: "var(--spacing-6)",
          textAlign: "center"
        }}
      >
        {showIcon && (
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "var(--border-radius-full)",
              backgroundColor: config.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--spacing-4)"
            }}
          >
            {React.cloneElement(config.icon as React.ReactElement<{ style?: React.CSSProperties }>, {
              style: {
                fontSize: "2rem",
                color: config.iconColor
              }
            })}
          </div>
        )}

        <h5
          id="confirm-dialog-title"
          style={{
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-gray-800)",
            marginBottom: "var(--spacing-3)"
          }}
        >
          {title}
        </h5>

        {message && (
          <p
            id="confirm-dialog-description"
            style={{
              color: "var(--color-gray-600)",
              marginBottom: "var(--spacing-4)",
              lineHeight: "var(--line-height-relaxed)"
            }}
          >
            {message}
          </p>
        )}

        {children && (
          <div style={{ marginBottom: "var(--spacing-4)" }}>
            {children}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "var(--spacing-3)",
            justifyContent: "center"
          }}
        >
          <Button
            variant="secondary"
            onClick={onHide}
            disabled={loading}
            style={{
              minWidth: "80px",
              fontWeight: "var(--font-weight-medium)"
            }}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant as any}
            onClick={handleConfirm}
            disabled={loading}
            aria-busy={loading}
            style={{
              minWidth: "80px",
              fontWeight: "var(--font-weight-medium)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-2)"
            }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                <span>Processing</span>
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmDialog;
