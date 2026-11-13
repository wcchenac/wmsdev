import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import HeaderAdmin from "./HeaderAdmin";
import HeaderOperator from "./HeaderOperator";
import HeaderNormal from "./HeaderNormal";
import HeaderSales from "./HeaderSales";
import { AppNavbar } from "../../../stories/frames";

const meta = {
  title: "Layout/RoleHeaders",
  component: HeaderAdmin,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <AppNavbar>
        <Story />
      </AppNavbar>
    ),
  ],
} satisfies Meta<typeof HeaderAdmin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Admin: Story = {};

export const Operator: Story = {
  render: () => <HeaderOperator />,
};

export const Normal: Story = {
  render: () => <HeaderNormal />,
};

export const Sales: Story = {
  render: () => <HeaderSales />,
};
