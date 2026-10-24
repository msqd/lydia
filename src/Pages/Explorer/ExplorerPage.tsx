import { FolderIcon } from "@heroicons/react/24/outline";
import { H2, P, Section } from "@msqd/lydia/Components";
import { Drawer } from "@msqd/lydia/Components/Dialog";
import { TransactionsExplorerSidebar } from "@msqd/lydia/Elements/Transactions";
import { type Selection, isUnder } from "@msqd/lydia/Models/Transactions/endpoints";
import type { DetailedTransaction, Transaction } from "@msqd/lydia/Models/Transactions/types";
import { TransactionsDetailPage } from "@msqd/lydia/Pages/Transactions/Detail";
import { TransactionsListPage, useClientSideTransactions } from "@msqd/lydia/Pages/Transactions/List";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

interface ExplorerPageProps {
  transactions: DetailedTransaction[];
  className?: string;
}

export function ExplorerPage({ transactions, className }: ExplorerPageProps) {
  const [selected, setSelected] = useState<Selection | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<DetailedTransaction | null>(null);
  const isDrawerOpen = selectedTransaction !== null;

  const filteredTransactions = useMemo(() => {
    if (!selected) return [];
    return transactions
      .filter((t) => isUnder(t, selected))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selected, transactions]);

  // The tree selection is the only filtering here, and it happens above: the embedded list still
  // paginates, so it is driven by the client-side fallback.
  const listedTransactions = useClientSideTransactions(filteredTransactions);

  const handleTransactionSelect = (transaction: Transaction) => {
    // Resolve the full detailed transaction from the data we were given.
    setSelectedTransaction(transactions.find((t) => t.id === transaction.id) ?? null);
  };

  const handleCloseDrawer = () => {
    setSelectedTransaction(null);
  };

  return (
    <div className={twMerge("h-full", className)}>
      <Section className="mb-6">
        <H2>API Explorer</H2>
        <P className="text-gray-500 mt-2">
          Browse and explore API endpoints hierarchically. Select an API or endpoint to view related transactions.
        </P>
      </Section>

      <div className="flex gap-4 h-[calc(100%-8rem)]">
        {/* Left panel - Tree view */}
        <TransactionsExplorerSidebar
          className="w-80"
          transactions={transactions}
          selected={selected}
          onSelect={setSelected}
        />

        {/* Right panel - Transaction list */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
          {selected ? (
            <TransactionsListPage
              {...listedTransactions}
              variant="embedded"
              onTransactionSelect={handleTransactionSelect}
              selectedId={selectedTransaction?.id ?? null}
              isDrawerOpen={isDrawerOpen}
              className="h-full"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Select an API or endpoint to view transactions</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title="Transaction Details">
        {selectedTransaction && <TransactionsDetailPage transaction={selectedTransaction} />}
      </Drawer>
    </div>
  );
}

export default ExplorerPage;
