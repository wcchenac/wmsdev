import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { DefectOptions, StockIdentifierType } from "../../../../../enums/Enums";
import StockInfo from "./StockInfo";

const handlers = {
  index: 0,
  typeList: [
    StockIdentifierType.board,
    StockIdentifierType.roll,
    StockIdentifierType.hardware,
  ],
  handleInfoChange: fn(),
  handleDefectChange: fn(),
  handleShipCheck: fn(),
  handleReasonButton: fn(),
};

const clothInfo = {
  productNo: "CT-2048",
  lotNo: "L26011",
  type: StockIdentifierType.roll,
  quantity: "12.5",
  unit: "碼",
  color: "3",
  defect: [DefectOptions[0]],
  record: "抽驗正常",
  remark: "",
  inStockType: "",
  orderNo: "IN2026001",
  directShip: false,
  outStockReason: "",
  errors: { quantity: "" },
};

function StockRow(props: React.ComponentProps<typeof StockInfo> & {
  typeValidation: boolean;
}) {
  return (
    <table className="table table-sm">
      <thead className="thead-dark">
        <tr>
          <th>貨號</th>
          <th>批號</th>
          <th>型態</th>
          <th>數量</th>
          {props.typeValidation ? (
            <>
              <th>單位</th>
              <th>記錄</th>
            </>
          ) : (
            <>
              <th>單位</th>
              <th>色號</th>
              <th>瑕疵</th>
              <th>記錄</th>
            </>
          )}
          <th>直出</th>
        </tr>
      </thead>
      <tbody>
        <StockInfo {...props} />
      </tbody>
    </table>
  );
}

const meta = {
  title: "Stock/InStock StockInfo",
  component: StockInfo,
  args: {
    ...handlers,
    typeValidation: false,
    stockInfo: clothInfo,
    errors: clothInfo.errors,
  },
} satisfies Meta<typeof StockInfo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ClothRow: Story = {
  render: (args) => <StockRow {...args} />,
};

export const QuantityError: Story = {
  args: {
    stockInfo: {
      ...clothInfo,
      quantity: "",
      errors: { quantity: "數量需大於 0" },
    },
    errors: { quantity: "數量需大於 0" },
  },
  render: (args) => <StockRow {...args} />,
};

export const DirectShipChecked: Story = {
  args: {
    stockInfo: {
      ...clothInfo,
      outStockReason: "中壢",
    },
  },
  render: (args) => <StockRow {...args} />,
};

export const LockedType: Story = {
  args: {
    typeValidation: true,
    typeList: [StockIdentifierType.hardware],
    stockInfo: {
      ...clothInfo,
      productNo: "HW-18",
      lotNo: "B-03",
      type: StockIdentifierType.hardware,
      quantity: "4",
      unit: "箱",
      color: "",
      defect: [],
      record: "",
    },
    errors: { quantity: "" },
  },
  render: (args) => <StockRow {...args} />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <StockRow {...args} />,
};
