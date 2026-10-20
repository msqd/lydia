import { TransactionsChart } from "@msqd/lydia/Components/Charts";
import { H3 } from "@msqd/lydia/Components/Typography/Titles";
import { TpdexBadge } from "@msqd/lydia/Elements/Tpdex/TpdexBadge";
import type { OverviewData } from "@msqd/lydia/Models";

export interface TransactionsHistoryViewProps {
  data: OverviewData;
  title?: string;
  className?: string;
}

export const TransactionsHistoryView = ({ data, title, className }: TransactionsHistoryViewProps) => {
  const meanDurationSeconds = Math.trunc(data.meanDuration) / 1000;
  const meanTpdex = Math.trunc(data.meanTpdex);
  const errorsRate = data.errors.rate.toLocaleString(undefined, { style: "percent", minimumFractionDigits: 1 });

  return (
    <div className={className}>
      <div className="flex">
        <div className="flex flex-col max-w-60">
          <H3>{title}</H3>
          <div className="flex flex-col items-center gap-2 self-center">
            <TpdexBadge score={meanTpdex} />
            <div className="text-xs font-normal text-center text-gray-600">{data.timeRange} average</div>
          </div>
          <div className="grid grid-cols-2 text-xs text-left align-text-bottom items-center self-center ml-10 mt-10">
            <span className="font-bold">Mean duration:</span>
            <span>{meanDurationSeconds} s</span>
            <span className="font-bold">Errors:</span>
            <span>{errorsRate}</span>
          </div>
        </div>
        <div className="grow h-full">
          <TransactionsChart data={data.transactions} timeRange={data.timeRange} />
        </div>
      </div>
    </div>
  );
};
