import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Header from "./Header";
import { RoleOption } from "../../enums/Enums";
import { withStore } from "../../stories/withStore";

type HeaderSessionArgs = {
  validToken?: boolean;
  authority?: string;
  fullName?: string;
};

const meta = {
  title: "Layout/Header",
  component: Header as ComponentType<HeaderSessionArgs>,
  decorators: [withStore],
  parameters: { layout: "fullscreen" },
  args: {
    validToken: false,
    authority: "",
    fullName: "",
  },
  argTypes: {
    validToken: { control: "boolean" },
    authority: {
      control: "select",
      options: ["", ...Object.values(RoleOption).filter(Boolean)],
    },
    fullName: { control: "text" },
  },
} satisfies Meta<HeaderSessionArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};

export const Admin: Story = {
  args: {
    validToken: true,
    authority: RoleOption["管理員"],
    fullName: "陳管理",
  },
};

export const Operator: Story = {
  args: {
    validToken: true,
    authority: RoleOption["庫存相關人員"],
    fullName: "林倉管",
  },
};

export const Normal: Story = {
  args: {
    validToken: true,
    authority: RoleOption["一般人員/門市"],
    fullName: "張門市",
  },
};

export const Sales: Story = {
  args: {
    validToken: true,
    authority: RoleOption["業務"],
    fullName: "李業務",
  },
};
