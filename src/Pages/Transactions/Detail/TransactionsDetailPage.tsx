import { type ComponentProps, useState } from "react";
import { twMerge } from "tailwind-merge";

import type { DetailedTransaction } from "@msqd/lydia/Models/Transactions/types";
import { TransactionMessage, TransactionMetadata } from "./Components";

export interface TransactionsDetailPageProps extends ComponentProps<"div"> {
  className?: string;
  /** The detailed transaction to display. */
  transaction: DetailedTransaction;
}

export function TransactionsDetailPage({ className, transaction, ...props }: TransactionsDetailPageProps) {
  const [tags, setTags] = useState<Record<string, string>>(transaction.tags ?? {});

  // Function to add a tag (for future use)
  const addTag = (tag: string, value: string) => {
    setTags({ ...tags, [tag]: value });
    // In a real app, you would save this change to a backend or store
  };

  // Function to remove a tag (for future use)
  const removeTag = (tag: string) => {
    const { [tag]: _removed, ...rest } = tags;
    setTags(rest);
    // In a real app, you would save this change to a backend or store
  };

  // Suppress unused variable warnings for now
  void addTag;
  void removeTag;

  const sections = (
    <>
      <TransactionMetadata transaction={transaction} tags={tags} defaultOpen={false} />
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
