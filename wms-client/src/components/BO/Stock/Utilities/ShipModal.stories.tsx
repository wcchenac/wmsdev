import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
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

export const NeedsReason: Story = {};

export const ReasonSelected: Story = {
  args: { outStockReason: "中壢" },
};

export const Closed: Story = {
  args: { show: false, outStockReason: "上貨櫃" },
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
};
