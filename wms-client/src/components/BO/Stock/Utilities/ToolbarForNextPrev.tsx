import React, { MouseEvent } from "react";
import { Button } from "react-bootstrap";

interface ToolbarForNextPrevProps {
  prevProduct: string | null;
  nextProduct: string | null;
  handleFutureProductQuery: (e: MouseEvent<HTMLButtonElement>) => void;
}

const ToolbarForNextPrev: React.FC<ToolbarForNextPrevProps> = ({
  prevProduct,
  nextProduct,
  handleFutureProductQuery,
}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: "var(--spacing-3)",
        alignItems: "center",
      }}
    >
      <Button
        variant="outline-secondary"
        value={prevProduct || ""}
        onClick={handleFutureProductQuery}
        disabled={prevProduct === null || prevProduct === ""}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--spacing-2)",
          padding: "var(--spacing-2) var(--spacing-4)",
          fontWeight: "var(--font-weight-medium)",
          borderRadius: "var(--border-radius-md)",
          transition: "var(--transition-fast)",
        }}
      >
        <i className="fa fa-chevron-left" aria-hidden="true" />
        上一筆
      </Button>
      <Button
        variant="outline-secondary"
        value={nextProduct || ""}
        onClick={handleFutureProductQuery}
        disabled={nextProduct === null || nextProduct === ""}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--spacing-2)",
          padding: "var(--spacing-2) var(--spacing-4)",
          fontWeight: "var(--font-weight-medium)",
          borderRadius: "var(--border-radius-md)",
          transition: "var(--transition-fast)",
        }}
      >
        下一筆
        <i className="fa fa-chevron-right" aria-hidden="true" />
      </Button>
    </div>
  );
};

export default ToolbarForNextPrev;
