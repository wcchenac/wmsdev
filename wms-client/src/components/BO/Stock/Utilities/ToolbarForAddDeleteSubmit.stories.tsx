import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import ToolbarForAddDeleteSubmit from "./ToolbarForAddDeleteSubmit";

const meta = {
  title: "Stock/ToolbarForAddDeleteSubmit",
  component: ToolbarForAddDeleteSubmit,
  args: {
    assignRowNum: "2",
    deleteDisabled: false,
    submitDisabled: false,
    onAddClick: fn(),
    onDeleteClick: fn(),
    onSubmitClick: fn(),
    handleRowNumChange: fn(),
    // Keep the form submit from reloading the story iframe.
    handleRowNumSubmit: fn((event: { preventDefault: () => void }) => event.preventDefault()),
  },
} satisfies Meta<typeof ToolbarForAddDeleteSubmit>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText("輸入列數")).toHaveValue("2");
    await expect(canvas.getByPlaceholderText("輸入列數")).not.toHaveAttribute("aria-invalid");

    await userEvent.click(canvas.getByRole("button", { name: "新增一列" }));
    await expect(args.onAddClick).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "刪除最後一列" }));
    await expect(args.onDeleteClick).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "新增" }));
    await expect(args.handleRowNumSubmit).toHaveBeenCalledTimes(1);
    await userEvent.type(canvas.getByPlaceholderText("輸入列數"), "3");
    await expect(args.handleRowNumChange).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "送出" }));
    await expect(args.onSubmitClick).toHaveBeenCalledTimes(1);
  },
};

export const DeleteDisabled: Story = {
  args: { deleteDisabled: true, assignRowNum: "" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "刪除最後一列" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "新增一列" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "送出" })).toBeEnabled();
  },
};

export const SubmitDisabled: Story = {
  args: { submitDisabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "送出" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "刪除最後一列" })).toBeEnabled();
  },
};

// 新增複數列數 above MAX_ASSIGN_ROW_COUNT (50): the input is marked invalid, a hint
// floats under it, and 新增 is disabled.
export const TooManyRows: Story = {
  args: { assignRowNum: "51" },
  decorators: [
    // The hint is an absolutely positioned tooltip below the input; leave room for it.
    (Story) => (
      <div style={{ paddingBottom: "2.5rem" }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("輸入列數");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("一次最多新增 50 列");
    await expect(canvas.getByText("一次最多新增 50 列")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "新增" })).toBeDisabled();
  },
};
