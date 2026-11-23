import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import ConfirmDialog from "./ConfirmDialog";

const openDialog = async () => {
  const dialog = await within(document.body).findByRole("dialog");
  await waitFor(() => expect(dialog).toBeVisible());
  return within(dialog);
};

const meta = {
  title: "UI/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    show: true,
    title: "確認執行操作",
    message: "此動作將會更新庫存紀錄，確定要繼續嗎？",
    confirmText: "確認",
    cancelText: "取消",
    variant: "warning",
    loading: false,
    showIcon: true,
    onHide: fn(),
    onConfirm: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["warning", "danger", "info", "question", "success"],
    },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Warning: Story = {
  play: async ({ args }) => {
    const dialog = await openDialog();
    await expect(dialog.getByText("確認執行操作")).toBeVisible();
    await expect(dialog.getByText("此動作將會更新庫存紀錄，確定要繼續嗎？")).toBeVisible();

    await userEvent.click(dialog.getByRole("button", { name: "確認" }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);

    await userEvent.click(dialog.getByRole("button", { name: "取消" }));
    await expect(args.onHide).toHaveBeenCalledTimes(1);
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    title: "刪除庫存紀錄",
    message: "刪除後無法復原，確定要刪除此筆資料？",
    confirmText: "確認刪除",
  },
  play: async () => {
    const dialog = await openDialog();
    const confirmBtn = dialog.getByRole("button", { name: "確認刪除" });
    await expect(confirmBtn).toHaveClass("btn-danger");
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    title: "刪除帳號中",
    message: "請稍候，正在處理您的請求。",
  },
  play: async ({ args }) => {
    const dialog = await openDialog();
    const buttons = dialog.getAllByRole("button");
    for (const button of buttons) {
      await expect(button).toBeDisabled();
    }
    await expect(dialog.getByText("處理中...")).toBeVisible();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

function InteractiveConfirmDialog() {
  const [show, setShow] = useState(true);
  const [status, setStatus] = useState("尚未確認");

  return (
    <div>
      <button
        type="button"
        className="btn btn-outline-danger me-2"
        onClick={() => setShow(true)}
      >
        開啟確認視窗
      </button>
      <span data-testid="dialog-status">{status}</span>
      <ConfirmDialog
        show={show}
        variant="question"
        title="送出調撥單"
        message="送出後將通知倉管人員備貨。"
        onHide={() => {
          setStatus("已取消");
          setShow(false);
        }}
        onConfirm={() => {
          setStatus("已確認送出");
          setShow(false);
        }}
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveConfirmDialog />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    let dialog = await openDialog();
    await userEvent.click(dialog.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(canvas.getByTestId("dialog-status")).toHaveTextContent("已取消");

    await userEvent.click(canvas.getByRole("button", { name: "開啟確認視窗" }));
    dialog = await openDialog();
    await userEvent.click(dialog.getByRole("button", { name: "確認" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(canvas.getByTestId("dialog-status")).toHaveTextContent("已確認送出");
  },
};
