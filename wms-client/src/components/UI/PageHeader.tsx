import React, { ReactNode } from "react";

/**
 * PageHeader Component Props
 * Provides consistent page header styling with title, subtitle, and actions
 */
export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  backButton?: ReactNode;
  className?: string;
}

/**
 * PageHeader Component
 * Provides consistent page header styling with title, subtitle, and actions
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  actions,
  backButton,
  className
}) => {
  return (
    <div
      className={`page-header ${className || ""}`}
      style={{
        marginBottom: "var(--spacing-6)",
        paddingBottom: "var(--spacing-4)",
        borderBottom: "1px solid var(--color-gray-200)"
      }}
    >
      {breadcrumb && (
        <nav
          aria-label="breadcrumb"
          style={{
            marginBottom: "var(--spacing-2)"
          }}
        >
          <ol
            className="breadcrumb"
            style={{
              backgroundColor: "transparent",
              padding: 0,
              margin: 0,
              fontSize: "var(--font-size-sm)"
            }}
          >
            {breadcrumb}
          </ol>
        </nav>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--spacing-3)"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-3)"
          }}
        >
          {backButton && (
            <div className="page-header-back">
              {backButton}
            </div>
          )}
          <div>
            <h1
              style={{
                fontSize: "var(--font-size-2xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-gray-900)",
                margin: 0,
                lineHeight: "var(--line-height-tight)"
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: "var(--font-size-base)",
                  color: "var(--color-gray-500)",
                  margin: "var(--spacing-1) 0 0 0"
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div
            className="page-header-actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-2)",
              flexWrap: "wrap"
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
