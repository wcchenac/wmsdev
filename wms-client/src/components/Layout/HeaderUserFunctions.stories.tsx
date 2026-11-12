import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import HeaderUserFunctions from "./HeaderUserFunctions";
import { AppNavbar } from "../../stories/frames";

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
        <div className="ml-auto d-flex">{/* spacer so the user links sit on the right */}</div>
        <Story />
      </AppNavbar>
    ),
  ],
} satisfies Meta<typeof HeaderUserFunctions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};

export const SignedIn: Story = {
  args: {
    isAuthencated: true,
    fullName: "陳管理",
    authority: "ROLE_Admin",
  },
};
