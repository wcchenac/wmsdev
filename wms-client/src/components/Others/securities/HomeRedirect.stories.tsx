import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { Route, Routes } from "react-router";
import { RoleOption } from "../../../enums/Enums";
import { withStore } from "../../../stories/withStore";
import HomeRedirect from "./HomeRedirect";

function HomeRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route
        path="/login"
        element={<div className="alert alert-warning mb-0">導向登入頁 (/login)</div>}
      />
      <Route
        path="/stock/1/1"
        element={<div className="alert alert-success mb-0">導向進貨單入庫 (/stock/1/1)</div>}
      />
      <Route
        path="/stock/2/1"
        element={<div className="alert alert-info mb-0">導向門市庫存查詢 (/stock/2/1)</div>}
      />
      <Route
        path="/stock/2/2"
        element={<div className="alert alert-primary mb-0">導向庫存查詢 (/stock/2/2)</div>}
      />
    </Routes>
  );
}

type SessionArgs = {
  validToken?: boolean;
  authority?: string;
};

const meta = {
  title: "Security/HomeRedirect",
  component: HomeRedirect as unknown as React.ComponentType<SessionArgs>,
  decorators: [withStore],
  parameters: {
    router: { initialEntries: ["/"] },
  },
  args: {
    validToken: true,
    authority: RoleOption["管理員"],
  },
  argTypes: {
    validToken: { control: "boolean" },
    authority: {
      control: "select",
      options: Object.values(RoleOption),
    },
  },
} satisfies Meta<SessionArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

const landsOn = (text: string): Story["play"] =>
  async ({ canvasElement }) => {
    const el = await within(canvasElement).findByText(text);
    await waitFor(() => expect(el).toBeVisible());
  };

export const SignedOut: Story = {
  args: { validToken: false, authority: "" },
  render: () => <HomeRoutes />,
  play: landsOn("導向登入頁 (/login)"),
};

export const AdminHome: Story = {
  args: { authority: RoleOption["管理員"] },
  render: () => <HomeRoutes />,
  play: landsOn("導向進貨單入庫 (/stock/1/1)"),
};

export const OperatorHome: Story = {
  args: { authority: RoleOption["庫存相關人員"] },
  render: () => <HomeRoutes />,
  play: landsOn("導向進貨單入庫 (/stock/1/1)"),
};

export const NormalHome: Story = {
  args: { authority: RoleOption["一般人員/門市"] },
  render: () => <HomeRoutes />,
  play: landsOn("導向門市庫存查詢 (/stock/2/1)"),
};

export const SalesHome: Story = {
  args: { authority: RoleOption["業務"] },
  render: () => <HomeRoutes />,
  play: landsOn("導向庫存查詢 (/stock/2/2)"),
};

export const UnknownRole: Story = {
  args: { authority: "ROLE_Unknown" },
  render: () => <HomeRoutes />,
  play: landsOn("此帳號沒有可使用的功能，請聯絡管理員確認權限。"),
};
