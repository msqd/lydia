import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircuitBreakerStatus } from "./CircuitBreakerStatus";

const meta: Meta<typeof CircuitBreakerStatus> = {
  title: "Elements/System/CircuitBreakerStatus",
  component: CircuitBreakerStatus,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CircuitBreakerStatus>;

export const Closed: Story = {
  args: {
    circuitBreaker: {
      status: "closed",
      failureRate: 2.1,
    },
  },
};

export const Open: Story = {
  args: {
    circuitBreaker: {
      status: "open",
      failureRate: 45.2,
    },
  },
};

export const HalfOpen: Story = {
  args: {
    circuitBreaker: {
      status: "half-open",
      failureRate: 12.8,
    },
  },
};

export const CompactClosed: Story = {
  args: {
    circuitBreaker: {
      status: "closed",
      failureRate: 2.1,
    },
    compact: true,
  },
};

export const CompactOpen: Story = {
  args: {
    circuitBreaker: {
      status: "open",
      failureRate: 45.2,
    },
    compact: true,
  },
};

export const EditableClosed: Story = {
  args: {
    circuitBreaker: {
      status: "closed",
      failureRate: 2.1,
    },
    editable: true,
    onChange: (status) => {
      console.log("Circuit breaker status changed to:", status);
    },
  },
};

export const EditableCompact: Story = {
  args: {
    circuitBreaker: {
      status: "closed",
      failureRate: 2.1,
    },
    compact: true,
    editable: true,
    onChange: (status) => {
      console.log("Circuit breaker status changed to:", status);
    },
  },
};
