import type { Meta, StoryObj } from "@storybook/react-vite";
import { CacheBadge } from "./CacheBadge";

const meta = {
  title: "Elements/Http/CacheBadge",
  component: CacheBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    cacheStatus: {
      control: "select",
      options: ["hit", "miss", "stale", "bypass", undefined],
      description: "The cache status of the request",
    },
    cached: {
      control: "boolean",
      description: "Legacy: Whether the request was cached",
    },
  },
} satisfies Meta<typeof CacheBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CacheHit: Story = {
  args: {
    cacheStatus: "hit",
  },
};

export const CacheMiss: Story = {
  args: {
    cacheStatus: "miss",
  },
};

export const CacheStale: Story = {
  args: {
    cacheStatus: "stale",
  },
};

export const CacheBypass: Story = {
  args: {
    cacheStatus: "bypass",
  },
};

export const LegacyCached: Story = {
  name: "Legacy Cached (true)",
  args: {
    cached: true,
  },
};

export const NoCacheInfo: Story = {
  name: "No Cache Info (hidden)",
  args: {},
};

export const AllStatuses: Story = {
  name: "All Cache Statuses",
  render: () => (
    <div className="flex items-center gap-2">
      <CacheBadge cacheStatus="hit" />
      <CacheBadge cacheStatus="miss" />
      <CacheBadge cacheStatus="stale" />
      <CacheBadge cacheStatus="bypass" />
    </div>
  ),
};
