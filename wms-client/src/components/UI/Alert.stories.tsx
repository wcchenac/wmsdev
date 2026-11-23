import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import Alert, { InlineMessage } from "./Alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  args: {
    variant: "info",
    title: "系統通知",
    children: "庫存資料已同步至最新狀態。",
    dismissible: false,
    showIcon: true,
    onDismiss: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(alert).toHaveAttribute("aria-live", "polite");
    await expect(alert).toHaveTextContent("系統通知");
    await expect(alert).toHaveTextContent("庫存資料已同步至最新狀態。");
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    title: "入庫成功",
    children: "已完成 3 筆入庫作業。",
  },
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(alert).toHaveAttribute("aria-live", "polite");
    await expect(alert).toHaveTextContent("入庫成功");
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "庫存提醒",
    children: "部分貨號安全庫存偏低，請留意補貨。",
  },
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(alert).toHaveTextContent("庫存提醒");
  },
};

export const ErrorAlert: Story = {
  name: "Error",
  args: {
    variant: "error",
    title: "操作失敗",
    children: "無法連線至伺服器，請稍後重試。",
  },
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(alert).toHaveAttribute("aria-live", "assertive");
    await expect(alert).toHaveTextContent("操作失敗");
  },
};

export const Dismissible: Story = {
  args: {
    variant: "info",
    title: "可關閉提示",
    children: "點擊右側關閉按鈕可隱藏此訊息。",
    dismissible: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "關閉訊息" }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    );
  },
};

export const InlineFeedback: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <InlineMessage variant="error">數量不可小於或等於 0</InlineMessage>
      <InlineMessage variant="warning">即將到達單次上限</InlineMessage>
      <InlineMessage variant="success">格式驗證通過</InlineMessage>
      <InlineMessage variant="info">僅限管理員變更此欄位</InlineMessage>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("數量不可小於或等於 0");
    await expect(canvas.getAllByRole("status")).toHaveLength(3);
  },
};
