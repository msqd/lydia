import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

import type { DetailedTransaction } from "@msqd/lydia/Models/Transactions/types";
import { TransactionMessage, TransactionMetadata } from "./Components";

export interface TransactionsDetailPageProps extends ComponentProps<"div"> {
  className?: string;
  /** The detailed transaction to display. */
  transaction: DetailedTransaction;
}

export function TransactionsDetailPage({ className, transaction, ...props }: TransactionsDetailPageProps) {
  const sections = (
    <>
      <TransactionMetadata transaction={transaction} tags={transaction.tags} defaultOpen={false} />
      <TransactionMessage title="Request" message={transaction.request} defaultOpen={true} />
      <TransactionMessage title="Response" message={transaction.response} defaultOpen={true} />
    </>
  );

  return (
    <div className={twMerge("h-full", className)} {...props}>
      <div className="h-full divide-y divide-gray-100 overflow-hidden">{sections}</div>
    </div>
  );
}
