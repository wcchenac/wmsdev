import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import Button from "./Button";
import IconButton from "./IconButton";
import PageHeader from "./PageHeader";

const meta = {
  title: "UI/PageHeader",
  component: PageHeader,
  args: {
    title: "庫存異動作業",
    subtitle: "查詢、編輯庫存紀錄並執行出庫或拉貨申請",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FullHeader: Story = {
  render: (args) => {
    const onBack = fn();
    const onCreate = fn();
    return (
      <PageHeader
        {...args}
        breadcrumb={
          <>
            <li className="breadcrumb-item">首頁</li>
            <li className="breadcrumb-item">庫存異動作業</li>
            <li className="breadcrumb-item active" aria-current="page">
              庫存異動
            </li>
          </>
        }
        backButton={
          <IconButton
            icon={<ArrowBackIcon fontSize="inherit" />}
            label="返回上一頁"
            onClick={onBack}
          />
        }
        actions={
          <Button variant="primary" size="sm" icon={<AddIcon fontSize="small" />} onClick={onCreate}>
            批量出庫
          </Button>
        }
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", { name: "breadcrumb" })).toBeVisible();
    await expect(canvas.getByRole("heading", { level: 1, name: "庫存異動作業" })).toBeVisible();
    await expect(canvas.getByText("查詢、編輯庫存紀錄並執行出庫或拉貨申請")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "返回上一頁" }));
    await userEvent.click(canvas.getByRole("button", { name: "批量出庫" }));
  },
};

export const MinimalTitleOnly: Story = {
  args: {
    title: "檔案總管",
    subtitle: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "檔案總管" })).toBeVisible();
    await expect(canvas.queryByRole("navigation", { name: "breadcrumb" })).not.toBeInTheDocument();
  },
};
