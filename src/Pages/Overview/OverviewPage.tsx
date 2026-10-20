import { HistorySection, type HistorySectionProps } from "./Sections/HistorySection";
import { SummarySection, type SummarySectionProps } from "./Sections/SummarySection";

export type { SummarySectionProps, ChartDataPoint, PerformanceData, RateData } from "./Sections/SummarySection";
export type { HistorySectionProps, HistoryEndpoint } from "./Sections/HistorySection";

export interface OverviewPageProps {
  /** Summary section data (performance, transactions and errors rates). */
  summary: SummarySectionProps;
  /** History section: selected time range, its change handler, and the data for that range. */
  history: HistorySectionProps;
}

const OverviewPage = ({ summary, history }: OverviewPageProps) => {
  return (
    <div className="space-y-8">
      <SummarySection {...summary} />
      <HistorySection {...history} />
    </div>
  );
};

export default OverviewPage;
export { OverviewPage };
