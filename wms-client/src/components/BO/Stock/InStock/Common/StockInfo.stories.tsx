import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
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
      <thead className="table-dark">
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

const field = (canvasElement: HTMLElement, name: string) =>
  canvasElement.querySelector<HTMLInputElement | HTMLSelectElement>(`[name=${name}]`)!;

// The 直出 cell shows an MUI checkbox icon: blank opens the ship modal, checked cancels it.
const shipIcon = (canvasElement: HTMLElement, checked: boolean) =>
  canvasElement.querySelector<SVGElement>(
    `[data-testid=${checked ? "CheckBoxRoundedIcon" : "CheckBoxOutlineBlankRoundedIcon"}]`
  );

export const ClothRow: Story = {
  render: (args) => <StockRow {...args} />,
  play: async ({ canvasElement, args }) => {
    await expect(field(canvasElement, "productNo")).toHaveValue("CT-2048");
    await expect(field(canvasElement, "productNo")).toBeDisabled();
    await expect(field(canvasElement, "lotNo")).toHaveValue("L26011");
    await expect(field(canvasElement, "type")).toHaveValue(StockIdentifierType.roll);
    await expect(field(canvasElement, "color")).toHaveValue("3");
    await expect(within(canvasElement).getByText(DefectOptions[0].label)).toBeVisible();

    await userEvent.type(field(canvasElement, "record"), "!");
    await expect(args.handleInfoChange).toHaveBeenCalled();

    // The blank 直出 box opens the ship modal; a reason button reports its value and row index.
    await userEvent.click(shipIcon(canvasElement, false)!);
    const dialog = await within(document.body).findByRole("dialog");
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(within(dialog).getByRole("button", { name: "中壢" }));
    await expect(args.handleReasonButton).toHaveBeenCalledWith("中壢", 0);

    await userEvent.click(within(dialog).getByRole("button", { name: "取消" }));
    await expect(args.handleShipCheck).toHaveBeenCalledWith(false, 0);
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument());
  },
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
  play: async ({ canvasElement }) => {
    await expect(field(canvasElement, "quantity")).toHaveClass("is-invalid");
    await expect(within(canvasElement).getByText("數量需大於 0")).toBeVisible();
  },
};

export const DirectShipChecked: Story = {
  args: {
    stockInfo: {
      ...clothInfo,
      outStockReason: "中壢",
    },
  },
  render: (args) => <StockRow {...args} />,
  play: async ({ canvasElement, args }) => {
    await expect(shipIcon(canvasElement, false)).toBeNull();
    const checked = shipIcon(canvasElement, true)!;
    await expect(checked).toBeInTheDocument();

    // Hovering shows the chosen reason; clicking the checked box cancels direct ship.
    await userEvent.hover(checked);
    await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent("中壢");
    await userEvent.click(checked);
    await expect(args.handleShipCheck).toHaveBeenCalledWith(false, 0);
    await userEvent.unhover(checked);
  },
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
  play: async ({ canvasElement }) => {
    // Hardware: type and unit are fixed text fields, and there is no 色號 / 瑕疵.
    await expect(field(canvasElement, "type").tagName).toBe("INPUT");
    await expect(field(canvasElement, "type")).toHaveValue(StockIdentifierType.hardware);
    await expect(field(canvasElement, "type")).toBeDisabled();
    await expect(field(canvasElement, "unit")).toHaveValue("箱");
    await expect(field(canvasElement, "unit")).toBeDisabled();
    await expect(canvasElement.querySelector("[name=color]")).toBeNull();
    await expect(field(canvasElement, "lotNo")).toBeEnabled();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <StockRow {...args} />,
  play: async ({ canvasElement }) => {
    for (const name of ["lotNo", "type", "quantity", "unit", "color", "record"]) {
      await expect(field(canvasElement, name)).toBeDisabled();
    }
    // The blank 直出 box does not open the ship modal.
    await userEvent.click(shipIcon(canvasElement, false)!, { pointerEventsCheck: 0 });
    await expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument();
  },
};
