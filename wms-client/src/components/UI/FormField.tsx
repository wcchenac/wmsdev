import React, { ReactNode, ReactElement, ChangeEvent, FocusEvent, InputHTMLAttributes } from "react";
import classnames from "classnames";

/**
 * FormField Component Props
 */
export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur'> {
  label?: ReactNode;
  name: string;
  type?: string;
  value?: string | number | readonly string[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  touched?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  className?: string;
  inputClassName?: string;
  children?: ReactElement;
}

/**
 * FormField Component
 * Provides consistent form field styling with label, validation, and helper text
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  touched = false,
  onChange,
  onBlur,
  className,
  inputClassName,
  children,
  ...props
}) => {
  const hasError = touched && error;
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const inputClasses = classnames(
    "form-control",
    {
      "is-invalid": hasError,
      "is-valid": touched && !error && value
    },
    inputClassName
  );

  const renderInput = (): ReactNode => {
    // If children is provided, render custom input
    if (children) {
      return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: inputId,
        name,
        className: inputClasses,
        "aria-required": required,
        "aria-invalid": hasError ? "true" : "false",
        "aria-describedby": hasError ? errorId : helperText ? helperId : undefined,
        disabled,
        readOnly
      });
    }

    // Otherwise render default input
    return (
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        placeholder={placeholder}
        className={inputClasses}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onBlur={onBlur}
        aria-required={required}
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
        {...props}
      />
    );
  };

  return (
    <div
      className={classnames("mb-3", className)}
      style={{
        marginBottom: "var(--spacing-4)"
      }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: "block",
            marginBottom: "var(--spacing-2)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--color-gray-700)",
            fontSize: "var(--font-size-base)"
          }}
        >
          {label}
          {required && (
            <span
              style={{
                color: "var(--color-danger)",
                marginLeft: "var(--spacing-1)"
              }}
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}
      {renderInput()}
      {hasError && (
        <div
          id={errorId}
          className="invalid-feedback"
          role="alert"
          style={{
            display: "block",
            marginTop: "var(--spacing-1)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-danger)"
          }}
        >
          {error}
        </div>
      )}
      {helperText && !hasError && (
        <small
          id={helperId}
          className="form-text text-muted"
          style={{
            marginTop: "var(--spacing-1)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-gray-500)"
          }}
        >
          {helperText}
        </small>
      )}
    </div>
  );
};

export default FormField;
