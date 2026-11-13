import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import HeaderStockFunctions from "./HeaderStockFunctions";
import { RoleOption } from "../../enums/Enums";
import { AppNavbar } from "../../stories/frames";
import { ROLE_NAV, navLabels } from "../../stories/playHelpers";

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

// HeaderStockFunctions picks the role's menu; the menus themselves are checked in RoleHeaders.
const showsNav = (expected: string[]): Story["play"] =>
  async ({ canvasElement }) => {
    await expect(navLabels(canvasElement)).toEqual(expected);
  };

export const SignedOut: Story = {
  args: { isAuthencated: false, authority: "" },
  play: showsNav([]),
};

export const Admin: Story = {
  args: { authority: RoleOption["管理員"] },
  play: showsNav(ROLE_NAV.admin),
};

export const Operator: Story = {
  args: { authority: RoleOption["庫存相關人員"] },
  play: showsNav(ROLE_NAV.operator),
};

export const Normal: Story = {
  args: { authority: RoleOption["一般人員/門市"] },
  play: showsNav(ROLE_NAV.normal),
};

export const Sales: Story = {
  args: { authority: RoleOption["業務"] },
  play: showsNav(ROLE_NAV.sales),
};

export const UnknownRole: Story = {
  args: { isAuthencated: true, authority: RoleOption["請選擇..."] },
  play: showsNav([]),
};
