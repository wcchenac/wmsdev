import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { trackPromise } from "react-promise-tracker";
import { LoadingSpinner } from "./LoadingSpinner";

const meta = {
  title: "Feedback/LoadingSpinner",
  component: LoadingSpinner,
  args: {
    area: "story-loading",
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: { area: "idle-area" },
  render: (args) => (
    <div>
      <p className="text-muted mb-0">
        No tracked promise is running, so this area stays empty.
      </p>
      <LoadingSpinner {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("status")).not.toBeInTheDocument();
  },
};

function BusySpinner(props: { area?: string }) {
  const area = props.area || "story-loading";

  useEffect(() => {
    trackPromise(new Promise(() => undefined), area);
  }, [area]);

  return <LoadingSpinner area={area} />;
}

export const InProgress: Story = {
  render: (args) => <BusySpinner area={args.area} />,
  play: async ({ canvasElement }) => {
    // The tracker reports the pending promise after the first render.
    const status = await within(canvasElement).findByRole("status");
    await expect(status).toHaveAttribute("aria-busy", "true");
    await expect(status).toHaveTextContent("Loading...");
    await expect(within(status).getByLabelText("loading-indicator")).toBeInTheDocument();
  },
};
