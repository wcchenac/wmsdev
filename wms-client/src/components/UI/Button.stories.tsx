import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Button from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "送出資料",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    block: false,
    iconPosition: "left",
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "light",
        "dark",
        "link",
        "outline-primary",
        "outline-secondary",
        "outline-success",
        "outline-danger",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement, args }) => {
    const btn = within(canvasElement).getByRole("button", { name: "送出資料" });
    await expect(btn).toBeEnabled();
    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="outline-primary">Outline Primary</Button>
      <Button variant="outline-danger">Outline Danger</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("button")).toHaveLength(7);
  },
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Button variant="primary" icon={<AddIcon fontSize="small" />} iconPosition="left">
        新增項目
      </Button>
      <Button variant="outline-primary" icon={<ArrowForwardIcon fontSize="small" />} iconPosition="right">
        下一步
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "新增項目" })).toHaveClass("btn-icon");
    await expect(canvas.getByRole("button", { name: "下一步" })).toHaveClass("btn-icon");
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  play: async ({ canvasElement, args }) => {
    const btn = within(canvasElement).getByRole("button");
    await expect(btn).toBeDisabled();
    await expect(btn).toHaveAttribute("aria-busy", "true");
    await expect(btn).toHaveAttribute("aria-disabled", "true");
    await expect(within(btn).getByText("載入中...")).toHaveClass("visually-hidden");
    await userEvent.click(btn, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const DisabledAndBlock: Story = {
  args: {
    disabled: true,
    block: true,
    children: "無法送出",
  },
  play: async ({ canvasElement, args }) => {
    const btn = within(canvasElement).getByRole("button", { name: "無法送出" });
    await expect(btn).toBeDisabled();
    await expect(btn).toHaveClass("w-100");
    await userEvent.click(btn, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
