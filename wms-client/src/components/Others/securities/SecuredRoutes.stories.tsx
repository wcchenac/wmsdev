import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Route, Routes } from "react-router";
import { RoleOption } from "../../../enums/Enums";
import { withStore } from "../../../stories/withStore";
import ProtectedRoute from "./ProtectedRoute";

type RoleLevel = React.ComponentProps<typeof ProtectedRoute>["level"];

function ProtectedPage() {
  return <div className="alert alert-success mb-0">已進入受保護頁面</div>;
}

// Mirrors App.tsx: a route guarded by ProtectedRoute, plus the /login and /
// targets it redirects to.
function AccessRoutes({ level }: { level: RoleLevel }) {
  return (
    <Routes>
      <Route
        path="/secure"
        element={
          <ProtectedRoute level={level}>
            <ProtectedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <div className="alert alert-warning mb-0">未登入，已導向登入頁</div>
        }
      />
      <Route
        path="/"
        element={
          <div className="alert alert-danger mb-0">權限不足，已導向首頁</div>
        }
      />
    </Routes>
  );
}

type SessionArgs = {
  validToken?: boolean;
  authority?: string;
};

const meta = {
  title: "Security/ProtectedRoute",
  component: ProtectedRoute as unknown as React.ComponentType<SessionArgs>,
  decorators: [withStore],
  parameters: {
    router: { initialEntries: ["/secure"] },
  },
  args: {
    validToken: true,
    authority: RoleOption["管理員"],
  },
  argTypes: {
    validToken: { control: "boolean" },
    authority: {
      control: "select",
      options: Object.values(RoleOption).filter(Boolean),
    },
  },
} satisfies Meta<SessionArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AdminRouteAllowed: Story = {
  render: () => <AccessRoutes level="H" />,
};

export const AdminRouteSignedOut: Story = {
  args: { validToken: false, authority: "" },
  render: () => <AccessRoutes level="H" />,
};

export const AdminRouteWrongRole: Story = {
  args: { authority: RoleOption["庫存相關人員"] },
  render: () => <AccessRoutes level="H" />,
};

export const OperatorRouteAllowed: Story = {
  args: { authority: RoleOption["庫存相關人員"] },
  render: () => <AccessRoutes level="M1" />,
};

export const OperatorRouteDeniedForSales: Story = {
  args: { authority: RoleOption["業務"] },
  render: () => <AccessRoutes level="M1" />,
};

export const FileRouteAllowedForSales: Story = {
  args: { authority: RoleOption["業務"] },
  render: () => <AccessRoutes level="M2" />,
};

export const FileRouteDeniedForStore: Story = {
  args: { authority: RoleOption["一般人員/門市"] },
  render: () => <AccessRoutes level="M2" />,
};

export const StoreQueryAllowed: Story = {
  args: { authority: RoleOption["一般人員/門市"] },
  render: () => <AccessRoutes level="L1" />,
};

export const StoreQueryDeniedForAdmin: Story = {
  args: { authority: RoleOption["管理員"] },
  render: () => <AccessRoutes level="L1" />,
};

export const DetailQueryAllowedForSales: Story = {
  args: { authority: RoleOption["業務"] },
  render: () => <AccessRoutes level="L2" />,
};

export const DetailQueryDeniedForStore: Story = {
  args: { authority: RoleOption["一般人員/門市"] },
  render: () => <AccessRoutes level="L2" />,
};

export const OutStockQueryAllowedForStore: Story = {
  args: { authority: RoleOption["一般人員/門市"] },
  render: () => <AccessRoutes level="L3" />,
};

export const OutStockQueryDeniedForOperator: Story = {
  args: { authority: RoleOption["庫存相關人員"] },
  render: () => <AccessRoutes level="L3" />,
};
