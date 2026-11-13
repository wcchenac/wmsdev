import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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

const buttons = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  return {
    prev: canvas.getByRole("button", { name: "上一筆" }),
    next: canvas.getByRole("button", { name: "下一筆" }),
  };
};

export const BothAvailable: Story = {
  play: async ({ canvasElement, args }) => {
    const { prev, next } = buttons(canvasElement);
    // The handler reads the product number to query from the clicked button's value.
    await expect(prev).toHaveValue("A-1000");
    await expect(next).toHaveValue("A-1002");

    await userEvent.click(prev);
    await userEvent.click(next);
    await expect(args.handleFutureProductQuery).toHaveBeenCalledTimes(2);
  },
};

export const NoPrevious: Story = {
  args: { prevProduct: "" },
  play: async ({ canvasElement, args }) => {
    const { prev, next } = buttons(canvasElement);
    await expect(prev).toBeDisabled();
    await expect(next).toBeEnabled();

    await userEvent.click(next);
    await expect(args.handleFutureProductQuery).toHaveBeenCalledTimes(1);
  },
};

export const NoNext: Story = {
  args: { nextProduct: null },
  play: async ({ canvasElement }) => {
    const { prev, next } = buttons(canvasElement);
    await expect(prev).toBeEnabled();
    await expect(next).toBeDisabled();
    await expect(next).toHaveValue("");
  },
};

export const NeitherAvailable: Story = {
  args: { prevProduct: "", nextProduct: "" },
  play: async ({ canvasElement }) => {
    const { prev, next } = buttons(canvasElement);
    await expect(prev).toBeDisabled();
    await expect(next).toBeDisabled();
  },
};
