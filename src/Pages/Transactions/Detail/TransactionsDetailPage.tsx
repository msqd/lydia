import { type ComponentProps, useState } from "react";
import { twMerge } from "tailwind-merge";

import { DefaultLayout } from "@msqd/lydia/Components/Layouts";
import { HeadingLevel } from "@msqd/lydia/Components/Typography/HeadingLevel";
import { H1 } from "@msqd/lydia/Components/Typography/Titles";
import type { DetailedTransaction } from "@msqd/lydia/Models/Transactions/types";
import { TransactionMessage, TransactionMetadata } from "./Components";

export interface TransactionsDetailPageProps extends ComponentProps<"div"> {
  className?: string;
  /** The detailed transaction to display. */
  transaction: DetailedTransaction;
  onBack?: () => void;
  isDrawer?: boolean; // Whether it's used as a drawer
}

export function TransactionsDetailPage({
  className,
  transaction,
  onBack,
  isDrawer = false,
  ...props
}: TransactionsDetailPageProps) {
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

  // Content for both drawer and full page
  const content = (
    <div className={twMerge("h-full", !isDrawer && "max-w-6xl mx-auto", className)} {...props}>
      {!isDrawer && <H1 className="mb-6">Transaction details</H1>}

      {/* Efficient transaction detail layout */}
      <div className={twMerge("divide-y divide-gray-100", isDrawer ? "h-full overflow-hidden" : "")}>
        {/* Under the page's h1 its sections head at h2. In a drawer there is no
            h1 here, and the sections keep the level of whatever holds them. */}
        {isDrawer ? sections : <HeadingLevel level={1}>{sections}</HeadingLevel>}
      </div>
    </div>
  );

  // If used as drawer, return content directly
  if (isDrawer) {
    return content;
  }

  // If used as full page, wrap with DefaultLayout
  return (
    <DefaultLayout contentClassName="space-y-4" navBarProps={{}}>
      {content}
    </DefaultLayout>
  );
}
