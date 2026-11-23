import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import ShowProductInformation from "./ShowProductInformation";

const sampleInfo = {
  productNo: "CF1001",
  picture: "無資料",
  cName: "平紋斜紋布料",
  spec: "58 英吋",
  packDesc: "220g",
  addType: "可追加",
  descrip: "無異動",
  cCCCODE: "品牌面料 A",
  supp: "S012",
  suppName: "宏遠紡織",
  userField1: "春季常備",
  prodDesc: "高密度防潑水處理",
  cCost: 0,
};

const meta = {
  title: "Stock/ShowProductInformation",
  component: ShowProductInformation,
  args: {
    isBasic: false,
    isQuery: true,
    productNo: "CF1001",
    productInfo: sampleInfo,
  },
} satisfies Meta<typeof ShowProductInformation>;

export default meta;

type Story = StoryObj<typeof meta>;

const openInfoModal = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "貨號資料" }));
  const dialog = await within(document.body).findByRole("dialog");
  await waitFor(() => expect(dialog).toBeVisible());
  return within(dialog);
};

export const AdminFullInfo: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openInfoModal(canvasElement);
    await expect(dialog.getByText("基本資訊")).toBeVisible();
    await expect(dialog.getByText("進階資訊")).toBeVisible();
    await expect(dialog.getByText("平紋斜紋布料")).toBeVisible();
    await expect(dialog.getByText("S012/宏遠紡織")).toBeVisible();
    await expect(dialog.getByText("0")).toBeVisible();

    await userEvent.click(dialog.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument()
    );
  },
};

export const BasicQueryOnly: Story = {
  args: {
    isBasic: true,
  },
  play: async ({ canvasElement }) => {
    const dialog = await openInfoModal(canvasElement);
    await expect(dialog.getByText("基本資訊")).toBeVisible();
    await expect(dialog.queryByText("進階資訊")).not.toBeInTheDocument();
  },
};

export const DisabledBeforeQuery: Story = {
  args: {
    isQuery: false,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "貨號資料" })).toBeDisabled();
  },
};
