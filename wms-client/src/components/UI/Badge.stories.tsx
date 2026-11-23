import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import CheckIcon from "@mui/icons-material/Check";
import Badge, { BadgeVariant, StatusBadge, StatusType } from "./Badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  args: {
    children: "整支",
    variant: "primary",
    size: "md",
    pill: false,
    dot: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "solid-primary",
        "solid-success",
        "solid-danger",
        "solid-warning",
        "solid-info",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("整支")).toBeVisible();
  },
};

const ALL_VARIANTS: BadgeVariant[] = [
  "default",
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "solid-primary",
  "solid-success",
  "solid-danger",
  "solid-warning",
  "solid-info",
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
      {ALL_VARIANTS.map((variant) => (
        <Badge key={variant} variant={variant} pill={variant.startsWith("solid-")}>
          {variant}
        </Badge>
      ))}
      <Badge variant="success" icon={<CheckIcon style={{ fontSize: "0.9rem" }} />}>
        含圖示
      </Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const variant of ALL_VARIANTS) {
      await expect(canvas.getByText(variant)).toBeVisible();
    }
    await expect(canvas.getByText("含圖示")).toBeVisible();
  },
};

export const SizesAndDot: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Badge size="sm" variant="primary">小</Badge>
      <Badge size="md" variant="primary">中</Badge>
      <Badge size="lg" variant="primary">大</Badge>
      <Badge dot variant="success">線上</Badge>
      <Badge dot variant="danger">異常</Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "線上" })).toBeInTheDocument();
    await expect(canvas.getByRole("status", { name: "異常" })).toBeInTheDocument();
  },
};

const STATUSES: [StatusType, string][] = [
  ["inStock", "有庫存"],
  ["outOfStock", "無庫存"],
  ["lowStock", "庫存不足"],
  ["pending", "待處理"],
  ["processing", "處理中"],
  ["completed", "已完成"],
  ["cancelled", "已取消"],
  ["active", "啟用"],
  ["inactive", "停用"],
];

export const StatusPresets: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {STATUSES.map(([status]) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [, label] of STATUSES) {
      await expect(canvas.getByText(label)).toBeVisible();
    }
  },
};
