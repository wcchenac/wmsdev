import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import CheckIcon from "@mui/icons-material/Check";
import IconButton, { ActionButtonGroup, IconButtonVariant } from "./IconButton";

const meta = {
  title: "UI/IconButton",
  component: IconButton,
  args: {
    icon: <EditIcon fontSize="inherit" />,
    label: "編輯項目",
    tooltip: "編輯項目細節",
    variant: "primary",
    size: "md",
    disabled: false,
    loading: false,
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "danger", "success", "warning", "info"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const btn = within(canvasElement).getByRole("button", { name: "編輯項目" });
    await expect(btn).toHaveAttribute("title", "編輯項目細節");
    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

const VARIANTS: [IconButtonVariant, string][] = [
  ["default", "預設檢視"],
  ["primary", "編輯"],
  ["danger", "刪除"],
  ["success", "核准"],
  ["warning", "警示"],
  ["info", "資訊"],
];

export const GroupAndVariants: Story = {
  render: () => (
    <ActionButtonGroup align="start" gap="md">
      {VARIANTS.map(([variant, label]) => (
        <IconButton
          key={variant}
          variant={variant}
          label={label}
          icon={
            variant === "danger" ? (
              <DeleteIcon fontSize="inherit" />
            ) : variant === "success" ? (
              <CheckIcon fontSize="inherit" />
            ) : variant === "info" ? (
              <InfoIcon fontSize="inherit" />
            ) : (
              <EditIcon fontSize="inherit" />
            )
          }
        />
      ))}
    </ActionButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [, label] of VARIANTS) {
      await expect(canvas.getByRole("button", { name: label })).toBeVisible();
    }
  },
};

export const LoadingAndDisabled: Story = {
  render: () => (
    <ActionButtonGroup align="start" gap="sm">
      <IconButton icon={<EditIcon fontSize="inherit" />} label="處理中按鈕" loading />
      <IconButton icon={<DeleteIcon fontSize="inherit" />} label="已停用按鈕" variant="danger" disabled />
    </ActionButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loadingBtn = canvas.getByRole("button", { name: "處理中按鈕" });
    const disabledBtn = canvas.getByRole("button", { name: "已停用按鈕" });
    await expect(loadingBtn).toBeDisabled();
    await expect(loadingBtn).toHaveAttribute("aria-busy", "true");
    await expect(disabledBtn).toBeDisabled();
  },
};
