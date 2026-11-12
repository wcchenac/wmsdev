import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
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
};
