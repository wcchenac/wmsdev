import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import QueryResponseWithNoStock from "./QueryResponseWithNoStock";

const meta = {
  title: "Stock/QueryResponseWithNoStock",
  component: QueryResponseWithNoStock,
  args: {
    productNo: "CF9999",
    onRetry: fn(),
  },
} satisfies Meta<typeof QueryResponseWithNoStock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithProductNoAndRetry: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole("heading", { name: "查無庫存資料" })).toBeVisible()
    );
    await expect(canvas.getByText("CF9999")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "重新搜尋" }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};

export const WithoutProductNoOrRetry: Story = {
  args: {
    productNo: undefined,
    onRetry: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByText("查無此貨號資料或此貨號已無庫存。")).toBeVisible()
    );
    await expect(canvas.queryByRole("button", { name: "重新搜尋" })).not.toBeInTheDocument();
  },
};
