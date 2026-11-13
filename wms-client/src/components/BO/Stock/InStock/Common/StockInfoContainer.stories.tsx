import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { StockIdentifierType } from "../../../../../enums/Enums";
import StockInfoContainer from "./StockInfoContainer";

const shared = {
  sequence: 0,
  index: 0,
  productNo: "CT-2048",
  orderNo: "PO-2026-014",
  type: "進貨",
  isLoading: false,
  typeValidation: false,
  waitHandleStatus: {
    [StockIdentifierType.roll]: { quantity: "10", unit: "碼" },
  },
  handleInStockRequestSubmit: fn(),
};

const meta = {
  title: "Stock/InStock StockInfoContainer",
  component: StockInfoContainer,
  args: shared,
} satisfies Meta<typeof StockInfoContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

// 待入庫總量 has one row per type: [貨號, 型態, 總數量, 目前數量, 單位].
const summaryRows = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll("table")[0].querySelectorAll("tbody tr"), (row) =>
    Array.from(row.querySelectorAll("input"), (input) => input.value)
  );

const quantityInputs = (canvasElement: HTMLElement) =>
  within(canvasElement).getAllByPlaceholderText("數量");

export const EmptyRow: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(summaryRows(canvasElement)).toEqual([["CT-2048", "整支", "10", "0", "碼"]]);
    await expect(quantityInputs(canvasElement)).toHaveLength(1);
    await expect(canvas.getByRole("button", { name: "送出" })).toBeDisabled();

    // Rows add and remove from the toolbar.
    await userEvent.click(canvas.getByRole("button", { name: "新增一列" }));
    await expect(quantityInputs(canvasElement)).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: "刪除最後一列" }));
    await expect(quantityInputs(canvasElement)).toHaveLength(1);

    // An invalid quantity shows the row error and keeps 送出 disabled.
    await userEvent.type(quantityInputs(canvasElement)[0], "abc");
    await expect(canvas.getByText("請輸入純數字或數量不可空白")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "送出" })).toBeDisabled();

    // Once 目前數量 matches 總數量 the form can be submitted.
    await userEvent.clear(quantityInputs(canvasElement)[0]);
    await userEvent.type(quantityInputs(canvasElement)[0], "10");
    await expect(summaryRows(canvasElement)[0][3]).toBe("10");
    const submit = canvas.getByRole("button", { name: "送出" });
    await expect(submit).toBeEnabled();
    await userEvent.click(submit);
    await expect(args.handleInStockRequestSubmit).toHaveBeenCalledTimes(1);
  },
};

export const Loading: Story = {
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ["新增一列", "刪除最後一列", "新增"]) {
      await expect(canvas.getByRole("button", { name })).toBeDisabled();
    }
    await expect(canvas.getByRole("button", { name: "處理中..." })).toBeDisabled();
    await expect(canvas.getByPlaceholderText("輸入列數")).toBeDisabled();
  },
};

export const HardwareOrder: Story = {
  args: {
    productNo: "HW-18",
    typeValidation: true,
    waitHandleStatus: {
      [StockIdentifierType.hardware]: { quantity: "4", unit: "箱" },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(summaryRows(canvasElement)).toEqual([["HW-18", "雜項", "4", "0", "箱"]]);
    // Hardware rows lock the type and unit, and have no 色號 / 瑕疵.
    const row = canvasElement.querySelectorAll("table")[1].querySelector("tbody tr")!;
    await expect(row.querySelector("input[name=type]")).toHaveValue("雜項");
    await expect(row.querySelector("input[name=type]")).toBeDisabled();
    await expect(row.querySelector("input[name=unit]")).toHaveValue("箱");
    await expect(row.querySelector("select[name=color]")).toBeNull();
  },
};

export const TwoTypes: Story = {
  args: {
    waitHandleStatus: {
      [StockIdentifierType.board]: { quantity: "2", unit: "支" },
      [StockIdentifierType.roll]: { quantity: "10", unit: "碼" },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(summaryRows(canvasElement)).toEqual([
      ["CT-2048", "板卷", "2", "0", "支"],
      ["CT-2048", "整支", "10", "0", "碼"],
    ]);

    // Filling one type is not enough: 送出 waits until every type matches.
    await userEvent.type(quantityInputs(canvasElement)[0], "10");
    await expect(summaryRows(canvasElement)[1][3]).toBe("10");
    await expect(canvas.getByRole("button", { name: "送出" })).toBeDisabled();

    await userEvent.click(canvas.getByRole("button", { name: "新增一列" }));
    const rows = canvasElement.querySelectorAll("table")[1].querySelectorAll("tbody tr");
    await userEvent.selectOptions(rows[1].querySelector("select[name=type]")!, "板卷");
    await userEvent.type(quantityInputs(canvasElement)[1], "2");
    await expect(summaryRows(canvasElement)[0][3]).toBe("2");
    await expect(canvas.getByRole("button", { name: "送出" })).toBeEnabled();
  },
};
