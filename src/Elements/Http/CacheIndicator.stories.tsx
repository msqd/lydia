import type { Meta, StoryObj } from "@storybook/react-vite";
import { CacheIndicator } from "./CacheIndicator";

const meta = {
  title: "Elements/Http/CacheIndicator",
  component: CacheIndicator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "CacheIndicator displays small database icons for cache status. No icon for cache miss (default behavior), green outlined icon for hit, yellow for stale, and red crossed-out icon for bypass.",
      },
    },
  },
  argTypes: {
    cacheStatus: {
      control: { type: "select" },
      options: ["hit", "miss", "stale", "bypass"],
      description: "The cache status to display",
    },
    cached: {
      control: { type: "boolean" },
      description: "Legacy boolean flag for cache status",
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "base", "lg"],
      description: "Size of the indicator",
    },
  },
} satisfies Meta<typeof CacheIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cacheStatus: "hit",
  },
};

export const CacheHit: Story = {
  args: {
    cacheStatus: "hit",
  },
  parameters: {
    docs: {
      description: {
        story: "Cache HIT - shown as a green outlined database icon when the response was served from cache",
      },
    },
  },
};

export const CacheMiss: Story = {
  args: {
    cacheStatus: "miss",
  },
  parameters: {
    docs: {
      description: {
        story: "Cache MISS - no icon shown (default behavior for requests forwarded to backend)",
      },
    },
  },
};

export const CacheStale: Story = {
  args: {
    cacheStatus: "stale",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Cache STALE - shown as a yellow outlined database icon when stale content was served while revalidating",
      },
    },
  },
};

export const CacheBypass: Story = {
  args: {
    cacheStatus: "bypass",
  },
  parameters: {
    docs: {
      description: {
        story: "Cache BYPASS - shown as a red crossed-out database icon when the cache was intentionally bypassed",
      },
    },
  },
};

export const LegacyCached: Story = {
  args: {
    cached: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Legacy support for boolean cached flag - displays as cache hit",
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <CacheIndicator cacheStatus="hit" size="xs" />
        <span className="text-xs">xs</span>
      </div>
      <div className="flex items-center gap-2">
        <CacheIndicator cacheStatus="hit" size="sm" />
        <span className="text-sm">sm</span>
      </div>
      <div className="flex items-center gap-2">
        <CacheIndicator cacheStatus="hit" size="base" />
        <span>base</span>
      </div>
      <div className="flex items-center gap-2">
        <CacheIndicator cacheStatus="hit" size="lg" />
        <span className="text-lg">lg</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available sizes for the cache indicator",
      },
    },
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CacheIndicator cacheStatus="hit" />
        <span>Cache HIT - Green outlined database icon</span>
      </div>
      <div className="flex items-center gap-2 min-h-6">
        <CacheIndicator cacheStatus="miss" />
        <span>Cache MISS - No icon (default behavior)</span>
      </div>
      <div className="flex items-center gap-2">
        <CacheIndicator cacheStatus="stale" />
        <span>Cache STALE - Yellow outlined database icon</span>
      </div>
      <div className="flex items-center gap-2">
        <CacheIndicator cacheStatus="bypass" />
        <span>Cache BYPASS - Red crossed-out database icon</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All cache status indicators with their visual representations",
      },
    },
  },
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">Example usage in a transaction list:</div>
      <div className="border rounded-md p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">GET /api/users</span>
          <span className="text-gray-500">•</span>
          <span className="text-sm">15ms</span>
          <CacheIndicator cacheStatus="hit" size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">POST /api/orders</span>
          <span className="text-gray-500">•</span>
          <span className="text-sm">234ms</span>
          <CacheIndicator cacheStatus="miss" size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">GET /api/products</span>
          <span className="text-gray-500">•</span>
          <span className="text-sm">89ms</span>
          <CacheIndicator cacheStatus="stale" size="sm" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Example of cache indicators in context with response times",
      },
    },
  },
};
