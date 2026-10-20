import { ClockIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Badge, H2, P, Section } from "@msqd/lydia/Components";
import type { BadgeColor } from "@msqd/lydia/Components/Badges/Badge";
import { Drawer } from "@msqd/lydia/Components/Dialog";
import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import { TransactionsListPage, useClientSideTransactions } from "@msqd/lydia/Pages/Transactions/List";
import type { ComponentProps } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export interface Alert {
  id: string;
  name: string;
  description: string;
  status: "firing" | "expired" | "archived" | "ignored";
  severity: "critical" | "warning" | "info";
  lastTriggered: string;
  affectedEndpoint?: string;
  transactionCount?: number;
  /** Transactions related to this alert, shown in the drawer when the alert is selected. */
  transactions?: Transaction[];
}

// Hoisted so the hook below sees a stable array: a fresh literal each render would defeat its memo.
const noTransactions: Transaction[] = [];

const statusColors: Record<Alert["status"], BadgeColor> = {
  firing: "danger",
  expired: "warning",
  archived: "blue",
  ignored: "default",
} as const;

const severityColors: Record<Alert["severity"], BadgeColor> = {
  critical: "danger",
  warning: "warning",
  info: "blue",
} as const;

const severityIcons = {
  critical: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

export interface AlertsPageProps extends ComponentProps<"div"> {
  alerts: Alert[];
}

export function AlertsPage({ alerts, className, ...props }: AlertsPageProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const isDrawerOpen = selectedAlert !== null;

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const handleCloseDrawer = () => {
    setSelectedAlert(null);
  };

  const alertTransactions = selectedAlert?.transactions ?? noTransactions;
  // An alert carries its own transactions, so there is no backend to filter them: this page is a
  // consumer of the client-side fallback rather than of a server.
  const relatedTransactions = useClientSideTransactions(alertTransactions);

  return (
    <div className={twMerge("space-y-6", className)} {...props}>
      {/* Page Header */}
      <Section>
        <H2>Active & Recent Alerts</H2>
        <P className="text-gray-500 mt-2">
          Monitor and manage API observability alerts. Click on any alert to view related transactions.
        </P>
      </Section>

      {/* Compact Alerts List */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => {
            const SeverityIcon = severityIcons[alert.severity];

            return (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <SeverityIcon
                      className={twMerge(
                        "h-4 w-4",
                        alert.severity === "critical" && "text-danger-500",
                        alert.severity === "warning" && "text-warning-500",
                        alert.severity === "info" && "text-blue-500",
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{alert.name}</h3>
                        <Badge color={severityColors[alert.severity]} className="flex-shrink-0 text-xs">
                          {alert.severity}
                        </Badge>
                        <Badge color={statusColors[alert.status]} className="flex-shrink-0 text-xs">
                          {alert.status}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-gray-500 flex-shrink-0">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>{alert.lastTriggered}</span>
                        </div>
                        {alert.affectedEndpoint && (
                          <span className="font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs">
                            {alert.affectedEndpoint}
                          </span>
                        )}
                        {alert.transactionCount && (
                          <span>
                            <span className="font-medium">{alert.transactionCount}</span> tx
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{alert.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={selectedAlert ? `Transactions for: ${selectedAlert.name}` : "Alert Transactions"}
        description={
          selectedAlert
            ? `Showing ${selectedAlert.transactionCount || 0} transactions related to this alert from ${selectedAlert.affectedEndpoint || "various endpoints"}`
            : "Related transaction details"
        }
        size="lg"
        position="right"
        backdrop={true}
      >
        {selectedAlert && (
          <div className="h-full">
            <TransactionsListPage {...relatedTransactions} className="h-full" />
          </div>
        )}
      </Drawer>
    </div>
  );
}
