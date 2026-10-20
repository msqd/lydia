import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Cards } from "@msqd/lydia/Components/Cards";
import { SummaryPerformancesChart, SummaryRateChart } from "@msqd/lydia/Components/Charts";
import { H2, H3 } from "@msqd/lydia/Components/Typography/Titles";
import { TpdexBadge } from "@msqd/lydia/Elements/Tpdex/TpdexBadge";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

/** Data point for time-series charts. */
export interface ChartDataPoint {
  datetime: string;
  value: number;
}

/** Performance (TPDEX) summary data. */
export interface PerformanceData {
  /** Mean TPDEX score (0-100). */
  mean: number;
  /** Hourly data points for the chart. */
  data: ChartDataPoint[];
}

/** Rate-based metric data (transactions or errors). */
export interface RateData {
  /** Rate value (count per period). */
  rate: number;
  /** Period label (e.g., "h" for hourly). */
  period: string;
  /** Hourly data points for the chart. */
  data: ChartDataPoint[];
}

/** Props for the SummarySection component. */
export interface SummarySectionProps {
  /** Performance/TPDEX data. */
  performance: PerformanceData;
  /** Transaction rate data. */
  transactions: RateData;
  /** Error rate data. */
  errors: RateData;
}

interface PaneProps extends ComponentProps<"div"> {
  className?: string;
}

const Pane = Object.assign(
  ({ className, children, ...props }: PaneProps) => {
    return (
      <Cards.Card className={twMerge("overflow-hidden relative h-60", className)} {...props}>
        {children}
      </Cards.Card>
    );
  },
  {
    Title: ({ children }: { children: React.ReactNode }) => (
      <div className="flex items-start relative z-10">{children}</div>
    ),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a
        href={to}
        className="leading-7 text-gray-400 mx-1 font-medium text-xs px-2 whitespace-nowrap z-10 flex items-center gap-1"
      >
        <ArrowTopRightOnSquareIcon className="h-3 w-3" />
        {children}
      </a>
    ),
    Badge: ({ children }: { children: React.ReactNode }) => (
      <div className="inline-flex flex-col self-center relative z-10 items-start">{children}</div>
    ),
    AbsoluteChart: ({ children }: { children: React.ReactNode }) => (
      <div className="absolute w-full h-full left-0 top-0">{children}</div>
    ),
  },
);

function RateBadge({ rate, period, className }: { rate: number; period: string; className?: string }) {
  return (
    <Pane.Badge>
      <div className={twMerge("bg-white ring-1 text-lg px-4 py-2 rounded", className)}>
        {rate} <span className="font-light">/{period}</span>
        <div className="text-xs font-normal text-gray-500 text-right">24h average</div>
      </div>
    </Pane.Badge>
  );
}

function SummaryPerformancesPane({ data }: { data: PerformanceData }) {
  return (
    <Pane>
      <Pane.Title>
        <H3>Performances (24h)</H3>
        <Pane.Link to="/transactions">details</Pane.Link>
      </Pane.Title>

      <Pane.Badge>
        <div className="flex flex-col items-center gap-1">
          <TpdexBadge score={data.mean} className="ring-1 ring-white" />
          <div className="text-xs font-normal text-right">24h average</div>
        </div>
      </Pane.Badge>

      <Pane.AbsoluteChart>
        <SummaryPerformancesChart data={data.data} />
      </Pane.AbsoluteChart>
    </Pane>
  );
}

function SummaryTransactionsPane({ data }: { data: RateData }) {
  return (
    <Pane>
      <Pane.Title>
        <H3>Transactions (24h)</H3>
        <Pane.Link to="/transactions">details</Pane.Link>
      </Pane.Title>

      <RateBadge className="ring-blue-200" rate={data.rate} period={data.period} />

      <Pane.AbsoluteChart>
        <SummaryRateChart data={data.data} color="--color-chart-transactions" />
      </Pane.AbsoluteChart>
    </Pane>
  );
}

function SummaryErrorsPane({ data }: { data: RateData }) {
  return (
    <Pane>
      <Pane.Title>
        <H3>Errors (24h)</H3>
        <Pane.Link to="/transactions?status=5&status=failure">details</Pane.Link>
      </Pane.Title>

      <RateBadge className="ring-danger-200" rate={data.rate} period={data.period} />
      <Pane.AbsoluteChart>
        <SummaryRateChart data={data.data} color="--color-danger-200" />
      </Pane.AbsoluteChart>
    </Pane>
  );
}

export const SummarySection = ({ performance, transactions, errors }: SummarySectionProps) => {
  return (
    <>
      <div className="flex justify-end my-2">
        <H2 className="grow">Summary</H2>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <SummaryPerformancesPane data={performance} />
        <SummaryTransactionsPane data={transactions} />
        <SummaryErrorsPane data={errors} />
      </div>
    </>
  );
};
