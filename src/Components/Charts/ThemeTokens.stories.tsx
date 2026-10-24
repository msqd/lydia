import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { TpdexBadge } from "../../Elements/Tpdex/TpdexBadge";
import type { OverviewTransaction } from "../../Models";
import { tpdexScale } from "../../Models/Tpdex";
import SummaryPerformancesChart from "./SummaryPerformancesChart";
import SummaryRateChart from "./SummaryRateChart";
import TransactionsChart from "./TransactionsChart";

/** Hand-picked so that a retheme is unmistakable: every overridden token turns violet or orange. */
const RETHEME: Record<string, string> = {
  "--color-danger-200": "oklch(70% 0.2 300)",
  "--color-success-200": "oklch(75% 0.17 60)",
  "--color-chart-transactions": "oklch(60% 0.2 140)",
  ...Object.fromEntries(tpdexScale.map(({ token }, i) => [token, `oklch(${40 + i * 6}% 0.2 ${300 - i * 10})`])),
};

const hours = Array.from({ length: 24 }, (_, i) => new Date(Date.UTC(2025, 5, 4, i)).toISOString());

const transactions: OverviewTransaction[] = hours.map((datetime, i) => ({
  datetime,
  count: 40 + ((i * 17) % 50),
  errors: (i * 7) % 11,
  cached: (i * 5) % 17,
}));

const rates = hours.map((datetime, i) => ({ datetime, value: 10 + ((i * 13) % 40) }));
const scores = hours.map((datetime, i) => ({ datetime, value: 100 - ((i * 37) % 100) }));

function RethemeDemo() {
  const [rethemed, setRethemed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    for (const [token, value] of Object.entries(RETHEME)) {
      if (rethemed) root.style.setProperty(token, value);
      else root.style.removeProperty(token);
    }
    return () => {
      for (const token of Object.keys(RETHEME)) root.style.removeProperty(token);
    };
  }, [rethemed]);

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        aria-pressed={rethemed}
        onClick={() => setRethemed((value) => !value)}
        className="self-start rounded bg-primary-600 px-3 py-1 text-white"
      >
        {rethemed ? "Restore the theme" : "Retheme danger, success and TPDEX"}
      </button>

      <div className="flex gap-1" data-testid="badges">
        {tpdexScale.map(({ label, threshold }) => (
          <TpdexBadge key={label} score={threshold ?? 0} />
        ))}
      </div>

      <div className="h-60 w-full">
        <SummaryPerformancesChart data={scores} />
      </div>
      <div className="h-60 w-full">
        <SummaryRateChart data={rates} color="--color-danger-200" />
      </div>
      <TransactionsChart data={transactions} />
    </div>
  );
}

const meta = {
  title: "Components/Charts/Theme tokens",
  component: RethemeDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Chart series read their colour from theme tokens (`--color-danger-200`, `--color-tpdex-*`, `--color-chart-*`) and follow a change at runtime. The button overrides the tokens on the root element, as a consumer's theme switch would.",
      },
    },
  },
} satisfies Meta<typeof RethemeDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Press the button. The TPDEX badges, the TPDEX line, the Errors bars (danger) and the transaction bars
 * (danger, success, transactions) all change colour together, with no reload. Press again to restore them.
 */
export const RuntimeRetheme: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getAllByRole("img", { name: /TPDEX A, / })[0] ?? canvas.getAllByRole("img")[0];
    const before = getComputedStyle(badge).backgroundColor;

    await userEvent.click(canvas.getByRole("button", { name: /Retheme/ }));

    await expect(getComputedStyle(badge).backgroundColor).not.toBe(before);
    await userEvent.click(canvas.getByRole("button", { name: /Restore/ }));
    await expect(getComputedStyle(badge).backgroundColor).toBe(before);
  },
};
