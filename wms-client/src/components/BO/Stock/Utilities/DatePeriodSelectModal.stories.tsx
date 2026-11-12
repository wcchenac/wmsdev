import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import "react-datepicker/dist/react-datepicker.css";
import DatePeriodSelectModal from "./DatePeriodSelectModal";
import { showStaticModal } from "../../../../stories/frames";

const start = new Date(2026, 10, 1);

const meta = {
  title: "Stock/DatePeriodSelectModal",
  component: DatePeriodSelectModal,
  decorators: [showStaticModal],
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
