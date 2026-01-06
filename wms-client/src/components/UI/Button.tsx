import React, { ReactNode, MouseEvent, ButtonHTMLAttributes } from "react";
import classnames from "classnames";

/**
 * Button variant types
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark"
  | "link"
  | "outline-primary"
  | "outline-secondary"
  | "outline-success"
  | "outline-danger";

/**
 * Button size types
 */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Button type types
 */
export type ButtonType = "button" | "submit" | "reset";

/**
 * Icon position types
 */
export type IconPosition = "left" | "right";

/**
 * Button Component Props
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: ButtonType;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  className?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Enhanced Button Component
 * Provides consistent button styling with loading states and icon support
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  block = false,
  icon,
  iconPosition = "left",
  className,
  onClick,
  ...props
}) => {
  const sizeClasses: Record<ButtonSize, string> = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg"
  };

  const buttonClasses = classnames(
    "btn",
    `btn-${variant}`,
    sizeClasses[size],
    {
      "btn-block": block,
      "btn-loading": loading,
      "btn-icon": icon && children
    },
    className
  );

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick && onClick(e);
  };

  const renderContent = (): ReactNode => {
    if (loading) {
      return (
        <>
          <span className="sr-only">Loading...</span>
          <span style={{ visibility: "hidden" }}>{children}</span>
        </>
      );
    }

    if (icon && iconPosition === "left") {
      return (
        <>
          <span className="btn-icon-element">{icon}</span>
          {children}
        </>
      );
    }

    if (icon && iconPosition === "right") {
      return (
        <>
          {children}
          <span className="btn-icon-element">{icon}</span>
        </>
      );
    }

    return children;
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
