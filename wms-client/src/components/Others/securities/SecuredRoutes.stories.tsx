import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Route, Switch } from "react-router-dom";
import { RoleOption } from "../../../enums/Enums";
import { withStore } from "../../../stories/withStore";
import SecuredRouteLvH from "./SecuredRouteLvH";
import SecuredRouteLvM1 from "./SecuredRouteLvM1";
import SecuredRouteLvM2 from "./SecuredRouteLvM2";
import SecuredRouteLvL1 from "./SecuredRouteLvL1";
import SecuredRouteLvL2 from "./SecuredRouteLvL2";
import SecuredRouteLvL3 from "./SecuredRouteLvL3";

function ProtectedPage() {
  return <div className="alert alert-success mb-0">已進入受保護頁面</div>;
}

function AccessSwitch({
  route,
}: {
  route: React.ElementType;
}) {
  const RouteComponent = route as React.ComponentType<{
    exact?: boolean;
    path?: string;
    component: React.ComponentType;
  }>;
  return (
    <Switch>
      <RouteComponent exact path="/secure" component={ProtectedPage} />
      <Route
        exact
        path="/login"
        render={() => (
          <div className="alert alert-warning mb-0">未登入，已導向登入頁</div>
        )}
      />
      <Route
        exact
        path="/"
        render={() => (
          <div className="alert alert-danger mb-0">權限不足，已導向首頁</div>
        )}
      />
    </Switch>
  );
}

const secureParameters = {
  router: { initialEntries: ["/secure"] },
};

type SessionArgs = {
  validToken?: boolean;
  authority?: string;
};

const meta = {
  title: "Security/SecuredRoutes",
  component: SecuredRouteLvH as unknown as React.ComponentType<SessionArgs>,
  decorators: [withStore],
  parameters: secureParameters,
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
  render: () => <AccessSwitch route={SecuredRouteLvH} />,
};

export const AdminRouteSignedOut: Story = {
  args: { validToken: false, authority: "" },
  render: () => <AccessSwitch route={SecuredRouteLvH} />,
};

export const AdminRouteWrongRole: Story = {
  args: { authority: RoleOption["庫存相關人員"] },
  render: () => <AccessSwitch route={SecuredRouteLvH} />,
};

export const OperatorRouteAllowed: Story = {
  args: { authority: RoleOption["庫存相關人員"] },
  render: () => <AccessSwitch route={SecuredRouteLvM1} />,
};

export const OperatorRouteDeniedForSales: Story = {
  args: { authority: RoleOption["業務"] },
  render: () => <AccessSwitch route={SecuredRouteLvM1} />,
};

export const FileRouteAllowedForSales: Story = {
  args: { authority: RoleOption["業務"] },
  render: () => <AccessSwitch route={SecuredRouteLvM2} />,
};

export const FileRouteDeniedForStore: Story = {
  args: { authority: RoleOption["一般人員/門市"] },
  render: () => <AccessSwitch route={SecuredRouteLvM2} />,
};

export const StoreQueryAllowed: Story = {
  args: { authority: RoleOption["一般人員/門市"] },
  render: () => <AccessSwitch route={SecuredRouteLvL1} />,
};

export const StoreQueryDeniedForAdmin: Story = {
  args: { authority: RoleOption["管理員"] },
  render: () => <AccessSwitch route={SecuredRouteLvL1} />,
};

export const DetailQueryAllowedForSales: Story = {
  args: { authority: RoleOption["業務"] },
  render: () => <AccessSwitch route={SecuredRouteLvL2} />,
};

export const DetailQueryDeniedForStore: Story = {
  args: { authority: RoleOption["一般人員/門市"] },
  render: () => <AccessSwitch route={SecuredRouteLvL2} />,
};

export const OutStockQueryAllowedForStore: Story = {
  args: { authority: RoleOption["一般人員/門市"] },
  render: () => <AccessSwitch route={SecuredRouteLvL3} />,
};

export const OutStockQueryDeniedForOperator: Story = {
  args: { authority: RoleOption["庫存相關人員"] },
  render: () => <AccessSwitch route={SecuredRouteLvL3} />,
};
