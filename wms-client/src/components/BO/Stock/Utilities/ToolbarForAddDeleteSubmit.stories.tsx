import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
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
