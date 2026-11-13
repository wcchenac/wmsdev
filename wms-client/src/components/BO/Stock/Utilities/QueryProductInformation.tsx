import React, { useState, useCallback, FormEvent, KeyboardEvent } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

/**
 * What onChange receives: the input's ChangeEvent, or a plain { target } object when the
 * clear button or Esc empties the field. Handlers may only read target.name / target.value.
 */
export interface ProductNoChange {
  target: {
    name: string;
    value: string;
  };
}

interface QueryProductInformationProps {
  productNo: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onChange: (e: ProductNoChange) => void;
  isLoading?: boolean;
}

const QueryProductInformation: React.FC<QueryProductInformationProps> = ({
  productNo,
  onSubmit,
  onChange,
  isLoading,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = productNo && productNo.length > 0;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleClear = useCallback(() => {
    // Create a synthetic event to clear the input
    const syntheticEvent: ProductNoChange = {
      target: {
        name: "productNo",
        value: "",
      },
    };
    onChange(syntheticEvent);
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleClear();
      }
    },
    [handleClear]
  );

  return (
    <div
      className="query-product-container"
      style={{
        padding: "var(--spacing-4)",
        backgroundColor: "var(--color-white)",
        borderRadius: "var(--border-radius-lg)",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "var(--spacing-4)",
      }}
    >
      <form onSubmit={onSubmit} role="search" aria-label="貨號搜尋">
        <div className="row mb-0 align-items-start">
          <label
            htmlFor="productNo-search"
            className="col-md-auto col-form-label"
            style={{
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-gray-700)",
              fontSize: "var(--font-size-md)",
            }}
          >
            <SearchIcon
              style={{
                marginRight: "var(--spacing-2)",
                verticalAlign: "middle",
                color: "var(--color-primary)",
              }}
            />
            貨號查詢
          </label>
          <div className="col-md">
            <div
              className="input-group"
              style={{
                position: "relative",
              }}
            >
              <input
                type="text"
                id="productNo-search"
                name="productNo"
                placeholder="請輸入貨號進行搜尋..."
                className="form-control"
                value={productNo}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                aria-describedby="search-help"
                disabled={isLoading}
                style={{
                  paddingRight: hasValue ? "2.5rem" : "var(--input-padding-x)",
                  borderColor: isFocused
                    ? "var(--color-primary)"
                    : "var(--input-border-color)",
                  boxShadow: isFocused ? "var(--shadow-focus)" : "none",
                  transition: "var(--transition-fast)",
                }}
              />
              {hasValue && !isLoading && (
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={handleClear}
                  aria-label="清除搜尋內容"
                  style={{
                    position: "absolute",
                    right: "0",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                    padding: "var(--spacing-1)",
                    color: "var(--color-gray-400)",
                    transition: "var(--transition-fast)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color =
                      "var(--color-gray-600)")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color =
                      "var(--color-gray-400)")
                  }
                >
                  <ClearIcon style={{ fontSize: "1.2rem" }} />
                </button>
              )}
            </div>
            <small
              id="search-help"
              className="form-text text-muted"
              style={{
                marginTop: "var(--spacing-1)",
                fontSize: "var(--font-size-xs)",
                whiteSpace: "nowrap",
              }}
            >
              輸入貨號後按 Enter 或點擊查詢按鈕，按 Esc 清除
            </small>
          </div>
          <div className="col-md-auto">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!hasValue || isLoading}
              aria-busy={isLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--spacing-2)",
                fontWeight: "var(--font-weight-medium)",
                padding: "var(--btn-padding-y) var(--btn-padding-x)",
                minWidth: "80px",
              }}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span>搜尋中</span>
                </>
              ) : (
                <>
                  <SearchIcon style={{ fontSize: "1.1rem" }} />
                  <span>查詢</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QueryProductInformation;
