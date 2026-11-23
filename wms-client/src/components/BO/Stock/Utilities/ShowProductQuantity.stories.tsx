import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import ShowProductQuantity from "./ShowProductQuantity";

const meta = {
  title: "Stock/ShowProductQuantity",
  component: ShowProductQuantity,
  args: {
    stockQuantity: [
      { type: "整支", quantity: 120, unit: "碼" },
      { type: "板卷", quantity: 3, unit: "支" },
    ],
  },
} satisfies Meta<typeof ShowProductQuantity>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MultipleTypes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("整支倉總和")).toBeVisible();
    await expect(canvas.getByText("120")).toBeVisible();
    await expect(canvas.getByText("板卷倉總和")).toBeVisible();
    await expect(canvas.getByText("3")).toBeVisible();
  },
};

export const ZeroQuantity: Story = {
  args: {
    stockQuantity: [
      { type: "雜項", quantity: 0, unit: "箱" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("雜項倉總和")).toBeVisible();
    await expect(canvas.getByText("0")).toBeVisible();
    await expect(canvas.getByText("箱")).toBeVisible();
  },
};
