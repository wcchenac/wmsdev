import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import ToolbarForNextPrev from "./ToolbarForNextPrev";

const meta = {
  title: "Stock/ToolbarForNextPrev",
  component: ToolbarForNextPrev,
  args: {
    prevProduct: "A-1000",
    nextProduct: "A-1002",
    handleFutureProductQuery: fn(),
  },
} satisfies Meta<typeof ToolbarForNextPrev>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BothAvailable: Story = {};

export const NoPrevious: Story = {
  args: { prevProduct: "" },
};

export const NoNext: Story = {
  args: { nextProduct: null },
};

export const NeitherAvailable: Story = {
  args: { prevProduct: "", nextProduct: "" },
};
