import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import FormField from "./FormField";

const meta = {
  title: "UI/FormField",
  component: FormField,
  args: {
    label: "員工編號",
    name: "employeeId",
    value: "",
    placeholder: "請輸入員工編號",
    required: false,
    disabled: false,
    readOnly: false,
    touched: false,
    onChange: fn(),
    onBlur: fn(),
  },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithHelperText: Story = {
  args: {
    required: true,
    helperText: "請輸入 4 至 12 碼英數字元。",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/員工編號/);
    await expect(input).toHaveAttribute("aria-required", "true");
    await expect(input).toHaveAttribute("aria-invalid", "false");
    await expect(input).toHaveAccessibleDescription("請輸入 4 至 12 碼英數字元。");
  },
};

export const InvalidError: Story = {
  args: {
    required: true,
    touched: true,
    error: "員工編號不可空白",
    helperText: "驗證失敗時會以錯誤訊息取代提示文字",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/員工編號/);
    await expect(input).toHaveClass("is-invalid");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("alert")).toHaveTextContent("員工編號不可空白");
    await expect(canvas.queryByText("驗證失敗時會以錯誤訊息取代提示文字")).not.toBeInTheDocument();
  },
};

export const ValidTouched: Story = {
  args: {
    value: "emp001",
    touched: true,
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText("員工編號");
    await expect(input).toHaveClass("is-valid");
    await expect(input).toHaveValue("emp001");
  },
};

function InteractiveFormField() {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const error = touched && !value.trim() ? "貨號為必填欄位" : "";

  return (
    <FormField
      label="貨號"
      name="productNo"
      value={value}
      placeholder="例如：CF1001"
      required
      touched={touched}
      error={error}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => setTouched(true)}
    />
  );
}

export const InteractiveValidation: Story = {
  render: () => <InteractiveFormField />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/貨號/);
    input.focus();
    input.blur();
    await expect(await canvas.findByRole("alert")).toHaveTextContent("貨號為必填欄位");

    await userEvent.type(input, "CF1001");
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(input).toHaveClass("is-valid");
  },
};

export const CustomSelectChild: Story = {
  args: {
    label: "入庫類型",
    name: "orderType",
    touched: false,
  },
  render: (args) => (
    <FormField {...args}>
      <select defaultValue="normal">
        <option value="normal">進貨單</option>
        <option value="assemble">組裝單</option>
      </select>
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByLabelText("入庫類型");
    await expect(select.tagName).toBe("SELECT");
    await expect(select).toHaveClass("form-control");
  },
};
