import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import Header from "./Header";
import { RoleOption } from "../../enums/Enums";
import { withStore } from "../../stories/withStore";
import { ROLE_NAV, navLabels } from "../../stories/playHelpers";

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

// Header reads the session from the store and shows the role's menu plus the user links.
// (登出 is not clicked: Header's logout reloads the page.)
const showsNav = (expected: string[]): Story["play"] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "庫存管理工具" })).toHaveAttribute("href", "/");
    await expect(navLabels(canvasElement)).toEqual(expected);

    // The mobile toggler opens and closes the collapsed menu. Bootstrap hides it on wide
    // screens (navbar-expand-sm), and a display: none element has no accessible name, so it
    // is found by the menu it controls.
    const toggler = canvasElement.querySelector<HTMLButtonElement>('button[aria-controls="mobile-nav"]')!;
    await expect(toggler).toHaveAttribute("aria-label", "開啟導覽選單");
    await expect(toggler).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggler);
    await expect(toggler).toHaveAttribute("aria-label", "關閉導覽選單");
    await expect(toggler).toHaveAttribute("aria-expanded", "true");
    await expect(canvasElement.querySelector("#mobile-nav")).toHaveClass("show");
    await userEvent.click(toggler);
    await expect(toggler).toHaveAttribute("aria-expanded", "false");
    await expect(canvasElement.querySelector("#mobile-nav")).not.toHaveClass("show");
  };

export const SignedOut: Story = {
  play: showsNav(["登入"]),
};

export const Admin: Story = {
  args: {
    validToken: true,
    authority: RoleOption["管理員"],
    fullName: "陳管理",
  },
  play: showsNav([...ROLE_NAV.admin, "陳管理", "登出"]),
};

export const Operator: Story = {
  args: {
    validToken: true,
    authority: RoleOption["庫存相關人員"],
    fullName: "林倉管",
  },
  play: showsNav([...ROLE_NAV.operator, "林倉管", "登出"]),
};

export const Normal: Story = {
  args: {
    validToken: true,
    authority: RoleOption["一般人員/門市"],
    fullName: "張門市",
  },
  play: showsNav([...ROLE_NAV.normal, "張門市", "登出"]),
};

export const Sales: Story = {
  args: {
    validToken: true,
    authority: RoleOption["業務"],
    fullName: "李業務",
  },
  play: showsNav([...ROLE_NAV.sales, "李業務", "登出"]),
};
