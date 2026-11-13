import React, { ReactNode, MouseEvent, KeyboardEvent, HTMLAttributes } from "react";
import classnames from "classnames";

/**
 * Card variant types
 */
export type CardVariant = "default" | "primary" | "success" | "warning" | "danger";

/**
 * Card Component Props
 */
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'title'> {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  variant?: CardVariant;
  hoverable?: boolean;
  clickable?: boolean;
  className?: string;
  bodyClassName?: string;
  onClick?: (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * Enhanced Card Component
 * Provides consistent card styling with header, body, and footer sections
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  footer,
  variant = "default",
  hoverable = false,
  clickable = false,
  className,
  bodyClassName,
  onClick,
  ...props
}) => {
  const cardClasses = classnames(
    "card",
    {
      "card-hover": hoverable,
      "card-clickable": clickable,
      [`card-${variant}`]: variant !== "default"
    },
    className
  );

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (clickable && onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (clickable && onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      style={{
        borderRadius: "var(--border-radius-md)",
        overflow: "hidden",
        transition: "var(--transition-base)"
      }}
      {...props}
    >
      {(title || headerActions) && (
        <div
          className="card-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--spacing-3) var(--spacing-4)",
            backgroundColor: "var(--color-gray-50)",
            borderBottom: "1px solid var(--color-gray-200)"
          }}
        >
          <div>
            {title && (
              <h5
                className="card-title mb-0"
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-gray-800)",
                  fontSize: "var(--font-size-md)"
                }}
              >
                {title}
              </h5>
            )}
            {subtitle && (
              <p
                className="card-subtitle mb-0 mt-1"
                style={{
                  color: "var(--color-gray-500)",
                  fontSize: "var(--font-size-sm)"
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="card-header-actions">{headerActions}</div>
          )}
        </div>
      )}
      <div
        className={classnames("card-body", bodyClassName)}
        style={{
          padding: "var(--spacing-4)"
        }}
      >
        {children}
      </div>
      {footer && (
        <div
          className="card-footer"
          style={{
            padding: "var(--spacing-3) var(--spacing-4)",
            backgroundColor: "var(--color-gray-50)",
            borderTop: "1px solid var(--color-gray-200)"
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
