import React from "react";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface QueryResponseWithNoStockProps {
  productNo?: string;
  onRetry?: () => void;
}

/**
 * QueryResponseWithNoStock - Enhanced empty state for stock queries
 * Shows when no stock is found for the queried product
 */
const QueryResponseWithNoStock: React.FC<QueryResponseWithNoStockProps> = ({
  productNo,
  onRetry,
}) => {
  return (
    <div
      className="query-no-result fade-in"
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "var(--spacing-8) var(--spacing-4)",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "var(--border-radius-full)",
            backgroundColor: "var(--color-warning-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--spacing-4)",
          }}
        >
          <WarningIcon
            style={{
              fontSize: "2.5rem",
              color: "var(--color-warning-dark)",
            }}
          />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-gray-800)",
            marginBottom: "var(--spacing-3)",
          }}
        >
          查無庫存資料
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "var(--font-size-base)",
            color: "var(--color-gray-600)",
            marginBottom: "var(--spacing-4)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          {productNo ? (
            <>
              貨號{" "}
              <strong style={{ color: "var(--color-gray-800)" }}>
                {productNo}
              </strong>{" "}
              查無資料， 可能是貨號不存在或已無庫存。
            </>
          ) : (
            "查無此貨號資料或此貨號已無庫存。"
          )}
        </p>

        {/* Info cards */}
        <div
          style={{
            display: "flex",
            gap: "var(--spacing-3)",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "var(--spacing-4)",
          }}
        >
          <div
            className="info-chip"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--spacing-2)",
              padding: "var(--spacing-2) var(--spacing-3)",
              backgroundColor: "var(--color-info-light)",
              borderRadius: "var(--border-radius-full)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-info-dark)",
            }}
          >
            <InfoIcon style={{ fontSize: "1rem" }} />
            <span>請確認貨號是否正確</span>
          </div>
          <div
            className="info-chip"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--spacing-2)",
              padding: "var(--spacing-2) var(--spacing-3)",
              backgroundColor: "var(--color-success-light)",
              borderRadius: "var(--border-radius-full)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-success-dark)",
            }}
          >
            <ShoppingCartIcon style={{ fontSize: "1rem" }} />
            <span>如需要請記得叫貨</span>
          </div>
        </div>

        {/* Retry button */}
        {onRetry && (
          <button
            className="btn btn-outline-primary"
            onClick={onRetry}
            style={{
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            重新搜尋
          </button>
        )}
      </div>
    </div>
  );
};

export default QueryResponseWithNoStock;
