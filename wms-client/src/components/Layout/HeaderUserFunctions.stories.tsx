import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import HeaderUserFunctions from "./HeaderUserFunctions";
import { AppNavbar } from "../../stories/frames";
import { expectNavHref, navLabels } from "../../stories/playHelpers";

const meta = {
  title: "Layout/HeaderUserFunctions",
  component: HeaderUserFunctions,
  parameters: { layout: "fullscreen" },
  args: {
    isAuthencated: false,
    fullName: "",
    authority: "",
    logout: fn(),
  },
  decorators: [
    (Story) => (
      <AppNavbar>
        <div className="ms-auto d-flex">{/* spacer so the user links sit on the right */}</div>
        <Story />
      </AppNavbar>
    ),
  ],
} satisfies Meta<typeof HeaderUserFunctions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
  play: async ({ canvasElement }) => {
    await expect(navLabels(canvasElement)).toEqual(["登入"]);
    await expectNavHref(canvasElement, "登入", "/login");
  },
};

export const SignedIn: Story = {
  args: {
    isAuthencated: true,
    fullName: "陳管理",
    authority: "ROLE_Admin",
  },
  play: async ({ canvasElement, args }) => {
    await expect(navLabels(canvasElement)).toEqual(["陳管理", "登出"]);
    // The avatar icon keeps its gap to the name (me-1).
    await expect(canvasElement.querySelector(".fa-user-circle-o")).toHaveClass("me-1");

    await userEvent.click(within(canvasElement).getByRole("link", { name: "登出" }));
    await expect(args.logout).toHaveBeenCalledTimes(1);
  },
};
