import { useFacetState } from "@msqd/lydia/Components/Facets";
import type { Filters } from "@msqd/lydia/Models/Filters";
import { deriveTransactionFacets } from "@msqd/lydia/Models/Transactions/facets";
import { sampleTransactions } from "@msqd/lydia/Models/Transactions/transactions.samples";
import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { TransactionsFiltersSidebar } from "./TransactionsFiltersSidebar";

const meta: Meta<typeof TransactionsFiltersSidebar> = {
  title: "Elements/Transactions/TransactionsFiltersSidebar",
  component: TransactionsFiltersSidebar,
  decorators: [
    (Story) => (
      <div style={{ minWidth: "320px", width: "320px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**TransactionsFiltersSidebar** provides transaction filtering in a clean, tree-view inspired design. Features include:\n\n- **ExplorerPage-Inspired Header**: Clean header with title and active filter count\n- **Visual Filter Count**: Shows number of active filters in the header\n- **Quick Reset**: Reset button appears when filters are active\n- **Compact Design**: Optimized for sidebar placement with proper scrolling",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    filters: {
      description: "Current filter state using unified Filters type",
    },
    title: {
      control: "text",
      description: "Custom title for the sidebar",
    },
    showDefaultHeader: {
      control: "boolean",
      description: "Whether to show the default header",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// The sidebar knows which facets exist, never what they can offer. These are what a consumer
// would send; here they are derived from the sample transactions, which is what the client-side
// fallback does for a consumer with no backend.
const facets = deriveTransactionFacets(sampleTransactions);

const defaultArgs = {
  filters: {} as Filters,
  onFiltersChange: fn(),
  onResetFilters: fn(),
  title: "Filters",
  showDefaultHeader: true,
  facets,
};

export const Default: Story = {
  args: defaultArgs,
};

export const WithFiltersApplied: Story = {
  args: {
    ...defaultArgs,
    filters: {
      endpoint: ["/api/users", "/api/orders"],
      method: ["GET", "POST"],
      status: ["2", "3"],
      flags: ["favorite", "monitored"],
      tags: ["production", "critical"],
      time: {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      },
      tpdex: { min: 20, max: 60 },
    },
  },
};

export const WithTimeFilter: Story = {
  args: {
    ...defaultArgs,
    filters: {
      time: {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      },
    },
  },
};

export const WithPerformanceFilter: Story = {
  args: {
    ...defaultArgs,
    filters: {
      tpdex: { min: 30, max: 70 },
    },
  },
};

export const InteractiveExample: Story = {
  render: (args) => {
    const { filters, handleFilterChange, resetFilters } = useFacetState(args.filters);

    return (
      <TransactionsFiltersSidebar
        {...args}
        filters={filters}
        onFiltersChange={handleFilterChange}
        onResetFilters={resetFilters}
      />
    );
  },
  args: defaultArgs,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test filter interactions with new component structure
    // Click on a status filter checkbox (using the actual checkbox role)
    const statusSuccessFilter = canvas.getByRole("checkbox", { name: /^2xx/ });
    await userEvent.click(statusSuccessFilter);

    // Click on a method filter checkbox
    const methodGetFilter = canvas.getByRole("checkbox", { name: /GET/ });
    await userEvent.click(methodGetFilter);

    // Test "only" button functionality
    const firstOnlyButton = canvas.getAllByText("only")[0];
    await userEvent.click(firstOnlyButton);

    // Verify we can find the filter sections
    await waitFor(() => {
      expect(canvas.getByText("Method")).toBeInTheDocument();
      expect(canvas.getByText("Status")).toBeInTheDocument();
      expect(canvas.getByText("Endpoint")).toBeInTheDocument();
    });
  },
};

export const OptionsFromAConsumer: Story = {
  args: {
    ...defaultArgs,
    facets: {
      endpoint: [
        { name: "/v1/checkout", label: "/v1/checkout", count: 1204 },
        { name: "/v1/cart", label: "/v1/cart", count: 318 },
      ],
      method: [
        { name: "POST", label: "POST", count: 1204 },
        { name: "PROPFIND", label: "PROPFIND", count: 3 },
      ],
      status: [{ name: "2", label: "2xx", count: 1500, under: [{ name: "200", label: "200", count: 1500 }] }],
      flags: [{ name: "favorite", label: "Favorite", count: 12 }],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Options and counts supplied by the consumer, which is the server-backed case. Note `PROPFIND` and the absent facets: the sidebar offers what its consumer says exists, including methods no built-in list would have contained, and nothing where it was told nothing.",
      },
    },
  },
};

export const WithNoOptions: Story = {
  args: {
    ...defaultArgs,
    facets: {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "Nothing supplied. Each facet says it has no values rather than offering endpoints nobody called and counts nobody measured. An empty facet is honest; a fictional one is not.",
      },
    },
  },
};

/**
 * One transaction per route through `effectiveCacheStatus`: an explicit `cacheStatus`, the legacy
 * `cached` boolean, and nothing at all. The sample set the other stories use reports no miss, so
 * the distinction this story is about cannot be seen there.
 */
const withCacheReporting = (id: string, url: string, reporting: Partial<Transaction>): Transaction => ({
  id,
  url,
  method: "GET",
  status: "Successful",
  statusCode: 200,
  timestamp: "2025-05-20T10:30:00",
  responseTime: 42,
  tpdex: 96,
  client: "Website",
  ...reporting,
});

const cacheReportingTransactions: Transaction[] = [
  withCacheReporting("cache-hit", "/api/products/456", { cacheStatus: "hit" }),
  withCacheReporting("cache-miss", "/api/orders", { cacheStatus: "miss" }),
  withCacheReporting("cache-legacy-miss", "/api/users/123/profile", { cached: false }),
  withCacheReporting("cache-unreported", "/api/search", {}),
];

export const CacheStatusNotReported: Story = {
  args: {
    ...defaultArgs,
    facets: deriveTransactionFacets(cacheReportingTransactions),
  },
  parameters: {
    docs: {
      description: {
        story:
          "**Not reported** is counted apart from **Cache Miss**, because they are different facts. A server that answered and said it missed, and a transaction that carried no cache information at all, are not the same thing, so a filter on `miss` matches the first and leaves the second alone. The legacy `cached: false` is still an explicit miss and joins the first; only silence becomes **Not reported**. Filling that silence with a miss would make a fabricated answer indistinguishable from a measured one.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cacheStatus = within(canvas.getByRole("group", { name: "Cache Status" }));

    // Two transactions reported a miss and one reported nothing. Were an absent status folded
    // back into `miss`, the counts would read 3 and "Not reported" would not be here to find,
    // so these two assertions are the regression guard rather than a description of the markup.
    await expect(cacheStatus.getByRole("checkbox", { name: /Cache Miss.*2/ })).toBeInTheDocument();
    await expect(cacheStatus.getByRole("checkbox", { name: /Not reported.*1/ })).toBeInTheDocument();
  },
};

export const CountsPartlyUnknown: Story = {
  args: {
    ...defaultArgs,
    facets: {
      method: [
        { name: "GET", label: "GET", count: 0 },
        { name: "POST", label: "POST" },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "A zero count and an unknown count are different claims. `GET` was measured and has none; `POST` was never counted, so no number is shown rather than a `0` the consumer never stated.",
      },
    },
  },
};
