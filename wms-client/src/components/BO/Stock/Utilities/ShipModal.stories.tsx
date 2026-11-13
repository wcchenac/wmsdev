import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import ShipModal from "./ShipModal";

const meta = {
  title: "Stock/ShipModal",
  component: ShipModal,
  args: {
    show: true,
    outStockReason: "",
    onChange: fn(),
    onReansonButtonChange: fn(),
    onShipClick: fn(),
    onCancleShipClick: fn(),
    handleModalClose: fn(),
  },
} satisfies Meta<typeof ShipModal>;

export default meta;

type Story = StoryObj<typeof meta>;

// The modal is a react-bootstrap Modal portaled to document.body; wait for the fade-in.
const openDialog = async () => {
  const dialog = await within(document.body).findByRole("dialog");
  await waitFor(() => expect(dialog).toBeVisible());
  return within(dialog);
};

export const NeedsReason: Story = {
  play: async ({ args }) => {
    const dialog = await openDialog();
    await expect(dialog.getByPlaceholderText("請輸入出庫原因")).toHaveValue("");
    await expect(dialog.getByRole("button", { name: "確認" })).toBeDisabled();

    await userEvent.click(dialog.getByRole("button", { name: "中壢" }));
    await expect(args.onReansonButtonChange).toHaveBeenCalledTimes(1);

    await userEvent.type(dialog.getByPlaceholderText("請輸入出庫原因"), "樣");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const ReasonSelected: Story = {
  args: { outStockReason: "中壢" },
  play: async ({ args }) => {
    const dialog = await openDialog();
    await expect(dialog.getByPlaceholderText("請輸入出庫原因")).toHaveValue("中壢");

    const confirm = dialog.getByRole("button", { name: "確認" });
    await expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    await expect(args.onShipClick).toHaveBeenCalledTimes(1);

    await userEvent.click(dialog.getByRole("button", { name: "取消" }));
    await expect(args.onCancleShipClick).toHaveBeenCalledTimes(1);
  },
};

export const Closed: Story = {
  args: { show: false, outStockReason: "上貨櫃" },
  play: async () => {
    await expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument();
  },
};

function InteractiveShipModal() {
  const [show, setShow] = useState(true);
  const [outStockReason, setOutStockReason] = useState("");

  return (
    <div>
      {!show && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShow(true)}
        >
          重新開啟出庫確認
        </button>
      )}
      <ShipModal
        show={show}
        outStockReason={outStockReason}
        onChange={(event) => setOutStockReason(event.target.value)}
        onReansonButtonChange={(event) =>
          setOutStockReason(event.currentTarget.value)
        }
        onShipClick={() => setShow(false)}
        onCancleShipClick={() => {
          setOutStockReason("");
          setShow(false);
        }}
        handleModalClose={() => setShow(false)}
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveShipModal />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Pick a reason with a button, then confirm: the modal closes.
    let dialog = await openDialog();
    await userEvent.click(dialog.getByRole("button", { name: "上貨櫃" }));
    await expect(dialog.getByPlaceholderText("請輸入出庫原因")).toHaveValue("上貨櫃");
    await userEvent.click(dialog.getByRole("button", { name: "確認" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());

    // Reopen: the reason is kept. 重置 clears it and disables 確認 again.
    await userEvent.click(await canvas.findByRole("button", { name: "重新開啟出庫確認" }));
    dialog = await openDialog();
    await expect(dialog.getByPlaceholderText("請輸入出庫原因")).toHaveValue("上貨櫃");
    await userEvent.click(dialog.getByRole("button", { name: "重置" }));
    await expect(dialog.getByPlaceholderText("請輸入出庫原因")).toHaveValue("");
    await expect(dialog.getByRole("button", { name: "確認" })).toBeDisabled();

    // Typing a reason works too; 取消 clears it and closes the modal.
    await userEvent.type(dialog.getByPlaceholderText("請輸入出庫原因"), "樣品");
    await expect(dialog.getByRole("button", { name: "確認" })).toBeEnabled();
    await userEvent.click(dialog.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());

    await userEvent.click(await canvas.findByRole("button", { name: "重新開啟出庫確認" }));
    dialog = await openDialog();
    await expect(dialog.getByPlaceholderText("請輸入出庫原因")).toHaveValue("");
  },
};
