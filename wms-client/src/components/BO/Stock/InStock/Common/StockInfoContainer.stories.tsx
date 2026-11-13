import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { StockIdentifierType } from "../../../../../enums/Enums";
import StockInfoContainer from "./StockInfoContainer";

const shared = {
  sequence: 0,
  index: 0,
  productNo: "CT-2048",
  orderNo: "PO-2026-014",
  type: "進貨",
  isLoading: false,
  typeValidation: false,
  waitHandleStatus: {
    [StockIdentifierType.roll]: { quantity: "10", unit: "碼" },
  },
  handleInStockRequestSubmit: fn(),
};

const meta = {
  title: "Stock/InStock StockInfoContainer",
  component: StockInfoContainer,
  args: shared,
} satisfies Meta<typeof StockInfoContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyRow: Story = {};

export const Loading: Story = {
  args: { isLoading: true },
};

export const HardwareOrder: Story = {
  args: {
    productNo: "HW-18",
    typeValidation: true,
    waitHandleStatus: {
      [StockIdentifierType.hardware]: { quantity: "4", unit: "箱" },
    },
  },
};

export const TwoTypes: Story = {
  args: {
    waitHandleStatus: {
      [StockIdentifierType.board]: { quantity: "2", unit: "支" },
      [StockIdentifierType.roll]: { quantity: "10", unit: "碼" },
    },
  },
};
