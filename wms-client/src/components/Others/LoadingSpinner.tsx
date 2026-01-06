import React from "react";
import { usePromiseTracker } from "react-promise-tracker";
import { ThreeDots } from "react-loader-spinner";

type SpinnerSize = "small" | "medium" | "large";

interface SizeConfig {
  height: number;
  width: number;
}

interface LoadingSpinnerProps {
  area?: string;
  size?: SpinnerSize;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  area,
  size = "medium",
  label = "Loading..."
}) => {
  const { promiseInProgress } = usePromiseTracker({ area });

  const sizeConfig: Record<SpinnerSize, SizeConfig> = {
    small: { height: 50, width: 50 },
    medium: { height: 80, width: 80 },
    large: { height: 100, width: 100 }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  if (!promiseInProgress) return null;

  return (
    <div
      className="loading-overlay fade-in"
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
        gap: "var(--spacing-3)",
        minHeight: "120px"
      }}
    >
      <ThreeDots
        color="var(--color-accent, #2BAD60)"
        height={config.height}
        width={config.width}
        ariaLabel="loading-indicator"
        visible={true}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};
