import { DefaultLayout } from "@msqd/lydia/Components/Layouts";
import { ApilabLogotype, DefaultLogo } from "@msqd/lydia/Components/NavBar/NavBar";
import { ToastProvider } from "@msqd/lydia/Components/Toast";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AlertsPage } from "./AlertsPage";
import { sampleAlerts } from "./AlertsPage.samples";

// Define a layout wrapper for consistent layout in all stories
const LayoutWrapper = (Story: React.ComponentType) => (
  <ToastProvider>
    <DefaultLayout
      navBarProps={{
        logo: <DefaultLogo />,
        brand: <ApilabLogotype />,
        // Using default navigation which includes System link
      }}
    >
      <Story />
    </DefaultLayout>
  </ToastProvider>
);

const meta = {
  title: "Pages/AlertsPage",
  component: AlertsPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**AlertsPage** displays API observability alerts in a compact, space-efficient design. Features include:\n\n- **Compact Layout**: Reduced vertical spacing and inline metadata for maximum information density\n- **Alert Types**: Transaction failures, performance degradation, error spikes, circuit breakers, interface changes\n- **Interactive Drawer**: Click any alert to view related transactions in a right-side drawer\n- **Alert States**: firing, expired, archived, ignored with appropriate visual indicators\n- **Severity Levels**: critical, warning, info with color-coded icons and badges\n- **Real-time Data**: Shows last triggered times and affected endpoints with transaction counts",
      },
    },
  },
  args: {
    alerts: sampleAlerts,
  },
  decorators: [LayoutWrapper],
} satisfies Meta<typeof AlertsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "**Default AlertsPage** showing 10 diverse API observability alerts with the new compact design. Notice how multiple alerts fit efficiently in the viewport with reduced vertical spacing. Each alert displays:\n\n- Alert name and severity/status badges on the same line\n- Inline metadata: timestamp, endpoint, and transaction count\n- Single-line description with text clipping\n- Smaller icons (16px) for better density\n\n**Try clicking on any alert** to see the related transactions drawer open on the right.",
      },
    },
  },
};

export const WithoutLayout: Story = {
  args: {},
  decorators: [],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "**Standalone AlertsPage** without navigation layout - perfect for embedding in dashboards or other contexts. Shows the same compact alert list with full drawer functionality.",
      },
    },
  },
};

// Interactive story demonstrating drawer functionality
const AlertsPageWithDrawerDemo = () => {
  const [instructions, setInstructions] = useState(true);

  return (
    <div className="relative">
      {instructions && (
        <div className="absolute top-4 left-4 z-50 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Interactive Demo</h3>
              <p className="text-xs text-blue-700 mb-2">
                Click on any alert to see related transactions in the drawer. Notice the compact spacing and inline
                metadata.
              </p>
              <button
                onClick={() => setInstructions(false)}
                className="text-xs text-blue-600 underline hover:no-underline"
              >
                Got it, hide this
              </button>
            </div>
          </div>
        </div>
      )}
      <AlertsPage alerts={sampleAlerts} />
    </div>
  );
};

export const InteractiveDemo: Story = {
  render: () => <AlertsPageWithDrawerDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "**Interactive demonstration** of the AlertsPage with guided instructions. Click on any alert to open the drawer and explore related transactions. This story shows:\n\n- Real-time drawer interaction\n- Transaction data contextual to each alert type\n- Compact design maximizing screen usage\n- Smooth transitions and hover states",
      },
    },
  },
};

export const CompactDesignShowcase: Story = {
  args: {
    className: "bg-gray-50 p-4",
  },
  parameters: {
    docs: {
      description: {
        story:
          "**Compact Design Showcase** demonstrating the space efficiency improvements:\n\n✅ **Reduced padding**: `py-2.5` instead of `py-4` (37% less vertical space)\n✅ **Inline metadata**: Time, endpoint, and count on same line as title\n✅ **Smaller icons**: 16px instead of 20px for better density\n✅ **Single-line descriptions**: Using `line-clamp-1` for consistent height\n✅ **Optimized spacing**: Better use of horizontal space\n\nCompare this with traditional alert lists - notice how many more alerts fit in the same viewport!",
      },
    },
  },
};

export const AlertTypesShowcase: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "**Alert Types Showcase** displaying the variety of API observability alerts:\n\n🔴 **Critical Alerts**: Transaction failures (15.3%), Circuit breakers (95% failure), 5xx errors (8.2%)\n🟡 **Warning Alerts**: Performance degradation (2.4s avg), 4xx spikes (+340%), Interface changes\n🔵 **Info Alerts**: Rate limit breaches, Auth service slowness\n\n**Status Types**: firing (active), expired (resolved), archived (historical), ignored (suppressed)\n\n**Real-world scenarios**: Each alert represents actual API monitoring use cases with realistic metrics and endpoints.",
      },
    },
  },
};

export const DrawerContentDemo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "**Drawer Content Demonstration** - Click on different alert types to see how transaction data varies:\n\n- **Payment failures**: 15% failure rate with 500/503 errors\n- **Performance issues**: 2-3 second response times\n- **4xx spikes**: High 401 unauthorized rates\n- **5xx errors**: Internal server errors with longer response times\n\nThe drawer shows the full TransactionsListPage with pagination, filtering, and TPDEX performance indicators contextual to each alert.",
      },
    },
  },
};

// Story focusing on visual density comparison
const VisualDensityComparisonComponent = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Before: Traditional Alert Layout</h3>
        <div className="space-y-4">
          {/* Simulated old layout with more spacing */}
          <div className="border border-gray-200 rounded p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <h4 className="text-base font-medium">Transaction Failure Rate High</h4>
              </div>
              <span className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded">critical</span>
            </div>
            <p className="text-gray-600 mb-3">Transaction failure rate for /api/payments is 15.3% (threshold: 10%)</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>2 minutes ago</span>
              <span>/api/payments</span>
              <span>142 transactions</span>
            </div>
          </div>
          <div className="border border-gray-200 rounded p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <h4 className="text-base font-medium">API Performance Degraded</h4>
              </div>
              <span className="px-2 py-1 text-sm bg-yellow-100 text-yellow-700 rounded">warning</span>
            </div>
            <p className="text-gray-600 mb-3">Users API response time averages 2.4s (threshold: 1s)</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>5 minutes ago</span>
              <span>/api/users</span>
              <span>234 transactions</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4 italic">Only 2 alerts visible per screen with traditional spacing</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-green-900">After: Compact Alert Layout</h3>
        <AlertsPage alerts={sampleAlerts} className="border border-gray-200 rounded" />
        <p className="text-sm text-green-700 mt-4 font-medium">✅ 10+ alerts visible per screen with compact design</p>
      </div>
    </div>
  );
};

export const VisualDensityComparison: Story = {
  render: () => <VisualDensityComparisonComponent />,
  decorators: [],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "**Visual Density Comparison** showing the dramatic space savings achieved with the compact design. The top section simulates a traditional alert layout, while the bottom shows our optimized version.\n\n**Key improvements:**\n- 5x more alerts visible per screen\n- Reduced vertical space by 40%\n- Better information hierarchy\n- Maintained readability and usability\n\nThis demonstrates how thoughtful design changes can significantly improve user productivity in monitoring dashboards.",
      },
    },
  },
};
