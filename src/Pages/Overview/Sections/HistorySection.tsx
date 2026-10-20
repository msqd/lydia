import { ButtonGroup } from "@msqd/lydia/Components/Buttons/ButtonGroup";
import { Cards } from "@msqd/lydia/Components/Cards";
import { H2 } from "@msqd/lydia/Components/Typography/Titles";
import type { OverviewData } from "@msqd/lydia/Models";
import { TransactionsHistoryView } from "./Components";

const buttonProps = [
  { key: "1h", title: "1 hour" },
  { key: "24h", title: "24 hours" },
  { key: "7d", title: "7 days" },
  { key: "1m", title: "1 month" },
];

/** One endpoint's history block. */
export interface HistoryEndpoint {
  name: string;
  data: OverviewData;
}

/** Props for the HistorySection component. */
export interface HistorySectionProps {
  /** Currently selected time range (one of the selector keys, e.g. "7d"). */
  timeRange: string;
  /** Called when the user picks a different time range; the consumer loads and passes new data. */
  onTimeRangeChange: (timeRange: string) => void;
  /** Aggregated transactions history for the selected range. */
  transactions: OverviewData;
  /** Per-endpoint history for the selected range. */
  endpoints: HistoryEndpoint[];
}

export const HistorySection = ({ timeRange, onTimeRangeChange, transactions, endpoints }: HistorySectionProps) => {
  return (
    <>
      <div className="flex justify-end my-2">
        <H2 className="grow">History</H2>
        <ButtonGroup buttonProps={buttonProps} current={timeRange} setCurrent={onTimeRangeChange} />
      </div>

      <Cards.Card className="mb-4">
        <TransactionsHistoryView title="Transactions" data={transactions} />
      </Cards.Card>

      <div className="grid grid-cols-2 gap-4">
        {endpoints.map((endpoint) => (
          <Cards.Card key={endpoint.name}>
            <TransactionsHistoryView title={endpoint.name} data={endpoint.data} />
          </Cards.Card>
        ))}
      </div>
    </>
  );
};
