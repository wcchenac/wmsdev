import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import HeaderAdmin from "./HeaderAdmin";
import HeaderOperator from "./HeaderOperator";
import HeaderNormal from "./HeaderNormal";
import HeaderSales from "./HeaderSales";
import { AppNavbar } from "../../../stories/frames";
import {
  ROLE_NAV,
  STOCK_IN_LINKS,
  STOCK_MODIFY_LINKS,
  expectDropdownLinks,
  expectNavHref,
  navLabels,
} from "../../../stories/playHelpers";

const meta = {
  title: "Layout/RoleHeaders",
  component: HeaderAdmin,
  parameters: { layout: "fullscreen" },
  // Each story names its role in parameters.authority, so the frame expands at that role's
  // breakpoint as the app's Header does.
  decorators: [
    (Story, { parameters }) => (
      <AppNavbar authority={parameters.authority as string | undefined}>
        <Story />
      </AppNavbar>
    ),
  ],
} satisfies Meta<typeof HeaderAdmin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Admin: Story = {
  parameters: { authority: "ROLE_Admin" },
  play: async ({ canvasElement }) => {
    await expect(navLabels(canvasElement)).toEqual(ROLE_NAV.admin);
    await expectDropdownLinks(canvasElement, "入庫作業", STOCK_IN_LINKS);
    await expectDropdownLinks(canvasElement, "庫存異動作業", STOCK_MODIFY_LINKS);
    await expectNavHref(canvasElement, "庫存查詢", "/stock/2/2");
    await expectNavHref(canvasElement, "管理員區域", "/admin");
  },
};

export const Operator: Story = {
  parameters: { authority: "ROLE_Operator" },
  render: () => <HeaderOperator />,
  play: async ({ canvasElement }) => {
    await expect(navLabels(canvasElement)).toEqual(ROLE_NAV.operator);
    await expectDropdownLinks(canvasElement, "入庫作業", STOCK_IN_LINKS);
    await expectDropdownLinks(canvasElement, "庫存異動作業", STOCK_MODIFY_LINKS);
    await expectNavHref(canvasElement, "庫存查詢", "/stock/2/2");
  },
};

export const Normal: Story = {
  parameters: { authority: "ROLE_Normal" },
  render: () => <HeaderNormal />,
  play: async ({ canvasElement }) => {
    await expect(navLabels(canvasElement)).toEqual(ROLE_NAV.normal);
    // Stores use the basic query page.
    await expectNavHref(canvasElement, "庫存查詢", "/stock/2/1");
    await expectNavHref(canvasElement, "出庫單查詢", "/stock/2/3");
  },
};

export const Sales: Story = {
  parameters: { authority: "ROLE_Sales" },
  render: () => <HeaderSales />,
  play: async ({ canvasElement }) => {
    await expect(navLabels(canvasElement)).toEqual(ROLE_NAV.sales);
    await expectNavHref(canvasElement, "庫存查詢", "/stock/2/2");
    await expectNavHref(canvasElement, "歷史記錄查詢", "/stock/5");
  },
};
