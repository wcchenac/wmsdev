import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HeaderStockFunctions from "./HeaderStockFunctions";
import { RoleOption } from "../../enums/Enums";
import { AppNavbar } from "../../stories/frames";

const meta = {
  title: "Layout/HeaderStockFunctions",
  component: HeaderStockFunctions,
  parameters: { layout: "fullscreen" },
  args: {
    isAuthencated: true,
    authority: RoleOption["管理員"],
  },
  argTypes: {
    authority: {
      control: "select",
      options: Object.values(RoleOption),
    },
  },
  decorators: [
    (Story) => (
      <AppNavbar>
        <Story />
      </AppNavbar>
    ),
  ],
} satisfies Meta<typeof HeaderStockFunctions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
  args: { isAuthencated: false, authority: "" },
};

export const Admin: Story = {
  args: { authority: RoleOption["管理員"] },
};

export const Operator: Story = {
  args: { authority: RoleOption["庫存相關人員"] },
};

export const Normal: Story = {
  args: { authority: RoleOption["一般人員/門市"] },
};

export const Sales: Story = {
  args: { authority: RoleOption["業務"] },
};

export const UnknownRole: Story = {
  args: { isAuthencated: true, authority: RoleOption["請選擇..."] },
};
