import { FolderIcon } from "@heroicons/react/24/outline";
import { H2, P, Section } from "@msqd/lydia/Components";
import { Drawer } from "@msqd/lydia/Components/Dialog";
import { TransactionsExplorerSidebar } from "@msqd/lydia/Elements/Transactions";
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
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedTransaction, setSelectedTransaction] = useState<DetailedTransaction | null>(null);
  const isDrawerOpen = selectedTransaction !== null;

  // No need to build tree - handled by TransactionsExplorerSidebar

  // Filter transactions based on selection
  const filteredTransactions = useMemo(() => {
    if (!selectedPath) return [];

    if (selectedType === "api") {
      // Show all transactions for the selected API
      return transactions
        .filter((t) => t.apiName === selectedPath)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
      // Show transactions that start with the selected path
      const [apiName, ...pathParts] = selectedPath.split("/");
      const pathPrefix = `/${pathParts.join("/")}`;

      return transactions
        .filter((t) => t.apiName === apiName && t.url.startsWith(pathPrefix))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }, [selectedPath, selectedType, transactions]);

  // The tree selection is the only filtering here, and it happens above: the embedded list still
  // paginates, so it is driven by the client-side fallback.
  const listedTransactions = useClientSideTransactions(filteredTransactions);

  const handleNodeSelect = (path: string, type: string) => {
    setSelectedPath(path);
    setSelectedType(type);
  };

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleTransactionSelect = (transaction: Transaction | null) => {
    // Resolve the full detailed transaction from the data we were given.
    const detailed = transaction ? (transactions.find((t) => t.id === transaction.id) ?? null) : null;
    setSelectedTransaction(detailed);
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
          selectedPath={selectedPath}
          expandedNodes={expandedNodes}
          onSelect={handleNodeSelect}
          onToggleExpand={handleToggleExpand}
        />

        {/* Right panel - Transaction list */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
          {selectedPath ? (
            <TransactionsListPage
              {...listedTransactions}
              variant="embedded"
              onTransactionSelect={handleTransactionSelect}
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
