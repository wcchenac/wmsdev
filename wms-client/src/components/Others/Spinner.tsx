import React from "react";
import { ThreeDots } from "react-loader-spinner";

type SpinnerSize = "small" | "medium" | "large";

interface SizeConfig {
  height: number;
  width: number;
}

interface SpinnerProps {
  size?: SpinnerSize;
  message?: string;
  color?: string;
}

export function Spinner({ size = "large", message, color }: SpinnerProps): React.ReactElement {
  const sizeConfig: Record<SpinnerSize, SizeConfig> = {
    small: { height: 40, width: 40 },
    medium: { height: 70, width: 70 },
    large: { height: 100, width: 100 }
  };

  const config = sizeConfig[size] || sizeConfig.large;
  const spinnerColor = color || "var(--color-accent, #2BAD60)";

  return (
    <div
      className="loading-container fade-in"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "var(--spacing-4)",
        padding: "var(--spacing-8)"
      }}
    >
      <ThreeDots
        color={spinnerColor}
        height={config.height}
        width={config.width}
        ariaLabel="loading"
        visible={true}
      />
      {message && (
        <p
          style={{
            color: "var(--color-gray-600)",
            fontSize: "var(--font-size-base)",
            margin: 0
          }}
        >
          {message}
        </p>
      )}
      <span className="sr-only">{message || "Loading content..."}</span>
    </div>
  );
}
