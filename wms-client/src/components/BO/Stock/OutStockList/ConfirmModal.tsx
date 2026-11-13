import React, { Component, KeyboardEvent } from "react";
import { Modal, Button } from "react-bootstrap";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import { OutStockInfo } from "./SearchInfo";

interface ModalConfig {
  title: string;
  message: string;
  warning: string | null;
  icon: React.ReactElement;
  iconBg: string;
  iconColor: string;
  confirmText: string;
  confirmVariant: string;
}

interface ConfirmModalProps {
  show: boolean;
  searchInfo: OutStockInfo;
  handleModalClose: () => void;
  cancelShip: (id: number) => Promise<void> | void;
  deleteOutStock: (id: number) => Promise<void> | void;
}

interface ConfirmModalState {
  isSubmitting: boolean;
}

class ConfirmModal extends Component<ConfirmModalProps, ConfirmModalState> {
  constructor(props: ConfirmModalProps) {
    super(props);
    this.state = {
      isSubmitting: false
    };
    this.onSubmitClick = this.onSubmitClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  getModalConfig(): ModalConfig {
    const { outStockType } = this.props.searchInfo;

    switch (outStockType) {
      case 0:
        return {
          title: "取消出貨確認",
          message: "是否取消出貨？",
          warning: "取消非當天出貨後，無法再以當天日期出貨",
          icon: <CancelIcon />,
          iconBg: "var(--color-warning-light)",
          iconColor: "var(--color-warning-dark)",
          confirmText: "確認取消",
          confirmVariant: "warning"
        };
      case 2:
        return {
          title: "刪除記錄確認",
          message: "是否刪除此筆記錄？",
          warning: "此操作無法復原",
          icon: <DeleteIcon />,
          iconBg: "var(--color-danger-light)",
          iconColor: "var(--color-danger)",
          confirmText: "確認刪除",
          confirmVariant: "danger"
        };
      default:
        return {
          title: "確認執行動作",
          message: "是否確認執行此操作？",
          warning: null,
          icon: <WarningIcon />,
          iconBg: "var(--color-info-light)",
          iconColor: "var(--color-info)",
          confirmText: "確認",
          confirmVariant: "primary"
        };
    }
  }

  async onSubmitClick(): Promise<void> {
    const { outStockType } = this.props.searchInfo;

    this.setState({ isSubmitting: true });

    try {
      switch (outStockType) {
        case 0:
          await this.props.cancelShip(this.props.searchInfo.stockIdentifierId!);
          break;
        case 2:
          await this.props.deleteOutStock(this.props.searchInfo.id);
          break;
        default:
          break;
      }
    } finally {
      this.setState({ isSubmitting: false });
    }
  }

  handleKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
    if (e.key === "Enter" && !this.state.isSubmitting) {
      this.onSubmitClick();
    }
  }

  render(): React.ReactNode {
    const { isSubmitting } = this.state;
    const config = this.getModalConfig();

    return (
      <Modal
        centered
        show={this.props.show}
        onHide={this.props.handleModalClose}
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        backdrop="static"
        keyboard={!isSubmitting}
        onKeyDown={this.handleKeyDown}
        size="sm"
      >
        <Modal.Body
          style={{
            padding: "var(--spacing-6)",
            textAlign: "center"
          }}
        >
          {/* Icon */}
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

          {/* Title */}
          <h5
            id="confirm-modal-title"
            style={{
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-gray-800)",
              marginBottom: "var(--spacing-3)"
            }}
          >
            {config.title}
          </h5>

          {/* Message */}
          <p
            id="confirm-modal-description"
            style={{
              color: "var(--color-gray-600)",
              marginBottom: config.warning ? "var(--spacing-2)" : "var(--spacing-4)",
              fontSize: "var(--font-size-base)"
            }}
          >
            {config.message}
          </p>

          {/* Warning */}
          {config.warning && (
            <p
              style={{
                color: "var(--color-warning-dark)",
                backgroundColor: "var(--color-warning-light)",
                padding: "var(--spacing-2) var(--spacing-3)",
                borderRadius: "var(--border-radius-base)",
                fontSize: "var(--font-size-sm)",
                marginBottom: "var(--spacing-4)"
              }}
            >
              <WarningIcon
                style={{
                  fontSize: "1rem",
                  marginRight: "var(--spacing-1)",
                  verticalAlign: "middle"
                }}
              />
              {config.warning}
            </p>
          )}

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-3)",
              justifyContent: "center"
            }}
          >
            <Button
              variant="secondary"
              onClick={this.props.handleModalClose}
              disabled={isSubmitting}
              style={{
                minWidth: "80px",
                fontWeight: "var(--font-weight-medium)"
              }}
            >
              取消
            </Button>
            <Button
              variant={config.confirmVariant}
              onClick={this.onSubmitClick}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              style={{
                minWidth: "100px",
                fontWeight: "var(--font-weight-medium)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--spacing-2)"
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span>處理中</span>
                </>
              ) : (
                config.confirmText
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

export default ConfirmModal;
