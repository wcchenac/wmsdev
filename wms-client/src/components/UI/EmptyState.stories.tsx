import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import Button from "./Button";
import EmptyState from "./EmptyState";

const meta = {
  title: "UI/EmptyState",
  component: EmptyState,
  args: {
    type: "default",
    compact: false,
  },
  argTypes: {
    type: {
      control: "select",
      options: ["default", "search", "error", "file"],
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole("status", { name: "尚無資料" });
    await expect(status).toHaveTextContent("目前沒有可顯示的資料");
  },
};

export const SearchWithAction: Story = {
  args: {
    type: "search",
    title: "找不到符合條件的貨號",
    description: "請確認輸入的貨號或日期區間是否正確。",
  },
  render: (args) => {
    const onReset = fn();
    return (
      <EmptyState
        {...args}
        action={
          <Button variant="outline-primary" size="sm" onClick={onReset}>
            清除條件
          </Button>
        }
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole("status", { name: "找不到符合條件的貨號" })).toBeVisible()
    );
    await userEvent.click(canvas.getByRole("button", { name: "清除條件" }));
  },
};

export const ErrorAndFileCompact: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      <EmptyState type="error" compact />
      <EmptyState type="file" compact />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "發生錯誤" })).toHaveTextContent("無法載入資料，請稍後再試");
    await expect(canvas.getByRole("status", { name: "尚無檔案" })).toHaveTextContent("尚未上傳任何檔案");
  },
};
