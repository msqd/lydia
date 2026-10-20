import { SummaryPerformancesChart, SummaryRateChart, TransactionsChart } from "@msqd/lydia/Components/Charts";
import type { ReactElement } from "react";

const point = { value: 1, datetime: "2025-01-01T00:00:00Z" };

export const charts: Record<string, ReactElement> = {
  TransactionsChart: (
    <TransactionsChart data={[{ datetime: "2025-01-01T00:00:00Z", count: 10, errors: 1, cached: 2 }]} />
  ),
  SummaryRateChart: <SummaryRateChart data={[point]} />,
  SummaryPerformancesChart: <SummaryPerformancesChart data={[point]} />,
};
