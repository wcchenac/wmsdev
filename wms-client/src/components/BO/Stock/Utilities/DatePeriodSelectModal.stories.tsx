import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import "react-datepicker/dist/react-datepicker.css";
import DatePeriodSelectModal from "./DatePeriodSelectModal";

const start = new Date(2026, 10, 1);

const meta = {
  title: "Stock/DatePeriodSelectModal",
  component: DatePeriodSelectModal,
  args: {
    btnTitle: "選擇區間",
    btnSize: "sm",
    fileType: "instock",
    dayRange: 30,
    startDate: start,
    endDate: new Date(2026, 10, 12),
    handleStartDateSelection: fn(),
    handleEndDateSelection: fn(),
    handleDateSelectionModeClick: fn(),
  },
  // The modal is a react-bootstrap Modal: open it so the story shows the dialog, not just the trigger.
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: args.btnTitle }));
    const dialog = await within(document.body).findByRole("dialog");
    // Wait for the fade-in transition before asserting visibility.
    await waitFor(() => expect(dialog).toBeVisible());
  },
} satisfies Meta<typeof DatePeriodSelectModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ValidRange: Story = {};

export const EndBeforeStart: Story = {
  args: {
    endDate: new Date(2026, 9, 20),
  },
};

export const LongerThanAllowed: Story = {
  args: {
    endDate: new Date(2026, 11, 15),
  },
};

export const LargeButton: Story = {
  args: { btnSize: "lg", btnTitle: "查詢歷史區間" },
};
