import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import Button from "./Button";
import Card from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
  args: {
    title: "貨號明細摘要",
    subtitle: "最近一次盤點更新於 2026-11-23",
    variant: "default",
    hoverable: false,
    clickable: false,
    children: "此貨號目前有 12 支整支庫存與 3 支板卷庫存。",
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "success", "warning", "danger"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithHeaderAndFooter: Story = {
  args: {
    headerActions: (
      <Button size="sm" variant="outline-primary">
        檢視明細
      </Button>
    ),
    footer: <span className="text-muted">資料來源：倉儲系統</span>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("貨號明細摘要")).toBeVisible();
    await expect(canvas.getByText("最近一次盤點更新於 2026-11-23")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "檢視明細" })).toBeVisible();
    await expect(canvas.getByText("資料來源：倉儲系統")).toBeVisible();
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
      <Card variant="primary" title="Primary">標準強調樣式</Card>
      <Card variant="success" title="Success">已完成狀態</Card>
      <Card variant="warning" title="Warning">待確認事項</Card>
      <Card variant="danger" title="Danger">異常警示</Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const label of ["Primary", "Success", "Warning", "Danger"]) {
      await expect(canvas.getByText(label)).toBeVisible();
    }
  },
};

export const Clickable: Story = {
  args: {
    title: "可點擊卡片",
    subtitle: "支援滑鼠點擊與鍵盤 Enter / Space 觸發",
    hoverable: true,
    clickable: true,
  },
  play: async ({ canvasElement, args }) => {
    const cardButton = within(canvasElement).getByRole("button");
    await expect(cardButton).toHaveAttribute("tabindex", "0");
    await userEvent.click(cardButton);
    cardButton.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
