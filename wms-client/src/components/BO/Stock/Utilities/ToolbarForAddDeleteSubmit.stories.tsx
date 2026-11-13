import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
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
    handleRowNumSubmit: (event: { preventDefault: () => void }) => {
      event.preventDefault();
      fn()(event);
    },
  },
} satisfies Meta<typeof ToolbarForAddDeleteSubmit>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const DeleteDisabled: Story = {
  args: { deleteDisabled: true, assignRowNum: "" },
};

export const SubmitDisabled: Story = {
  args: { submitDisabled: true },
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
