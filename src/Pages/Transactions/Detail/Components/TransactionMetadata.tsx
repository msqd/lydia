import { ArrowRightIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { Badge } from "@msqd/lydia/Components/Badges";
import { Button } from "@msqd/lydia/Components/Buttons";
import { contentPaddingClassName } from "@msqd/lydia/Components/Cards";
import { useSuccessToast } from "@msqd/lydia/Components/Toast";
import { Foldable } from "@msqd/lydia/Components/Utilities/Foldable";
import { CacheBadge, CacheIndicator, RequestMethodBadge, ResponseStatusBadge } from "@msqd/lydia/Elements/Http";
import { TpdexBadge } from "@msqd/lydia/Elements/Tpdex/TpdexBadge";
import type { DetailedTransaction } from "@msqd/lydia/Models/Transactions/types";
import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface TransactionMetadataProps extends ComponentProps<"div"> {
  /**
   * Transaction data
   */
  transaction: DetailedTransaction;
  /**
   * Tags to display
   */
  tags?: Record<string, string>;
  /**
   * Default open state for the foldable
   */
  defaultOpen?: boolean;
}

/**
 * Component that displays transaction metadata in a foldable section
 * Includes URL, status, timing, client info, and tags
 */
export function TransactionMetadata({
  transaction,
  tags = {},
  defaultOpen = false,
  className,
  ...props
}: TransactionMetadataProps) {
  const success = useSuccessToast();
  const formattedDate = new Date(transaction.timestamp).toLocaleString();

  // Function to copy URL to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      success("Copied", `${label} copied to clipboard`);
    } catch (error) {
      success("Copy", label);
    }
  };

  // Request summary component
  const RequestSummary = () => {
    const url = new URL(transaction.url, "http://example.com"); // Parse URL for path and query
    const path = url.pathname;
    const queryString = url.search;

    return (
      <span className="font-normal">
        <RequestMethodBadge method={transaction.method} />
        {transaction.apiName && (
          <span className="inline-flex items-center bg-gray-50 px-1 ml-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
            {transaction.apiName}
          </span>
        )}
        <span className="text-gray-500 font-mono text-xs ml-1" title={transaction.url}>
          {path}
        </span>
        {queryString && (
          <span className="text-gray-500 font-mono text-xs" title={transaction.url}>
            {queryString}
          </span>
        )}
      </span>
    );
  };

  // Response summary component
  const ResponseSummary = () => (
    <span className="font-normal">
      <ResponseStatusBadge statusCode={transaction.statusCode} />
    </span>
  );

  // Duration component with TPDEX
  const DurationDisplay = () => (
    <div className="flex gap-x-1 items-center font-normal">
      <TpdexBadge score={transaction.tpdex} responseTime={transaction.responseTime} />
      <span className="text-sm">{transaction.responseTime}ms</span>
      <CacheIndicator cacheStatus={transaction.cacheStatus} cached={transaction.cached} size="sm" />
    </div>
  );

  return (
    <div className={twMerge(contentPaddingClassName, className)} {...props}>
      <Foldable
        title={
          <div className="flex gap-x-1 items-center">
            <RequestSummary />
            <ArrowRightIcon className="h-4 w-4 text-gray-400 mx-1" />
            <ResponseSummary />
            <div className="flex-1" />
            <DurationDisplay />
          </div>
        }
        defaultOpen={defaultOpen}
      >
        <div className="space-y-4">
          {/* URL and Copy Button */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
              <RequestMethodBadge method={transaction.method} />
              <span className="font-mono text-sm text-gray-900 break-all">{transaction.url}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => copyToClipboard(`${transaction.method} ${transaction.url}`, "Transaction URL")}
              className="flex items-center space-x-1 flex-shrink-0"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              <span>Copy</span>
            </Button>
          </div>

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="mt-1">
                <ResponseStatusBadge statusCode={transaction.statusCode} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Duration</div>
              <div className="mt-1 text-sm text-gray-900">{transaction.responseTime}ms</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">TPDEX</div>
              <div className="mt-1">
                <TpdexBadge score={transaction.tpdex} responseTime={transaction.responseTime} showScore={true} />
              </div>
            </div>
            {(transaction.cacheStatus || transaction.cached) && (
              <div>
                <div className="text-sm font-medium text-gray-500">Cache Status</div>
                <div className="mt-1">
                  <CacheBadge cacheStatus={transaction.cacheStatus} cached={transaction.cached} />
                </div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-gray-500">Client</div>
              <div className="mt-1 text-sm text-gray-900">{transaction.client}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Created</div>
              <div className="mt-1 text-sm text-gray-900">{formattedDate}</div>
            </div>
            {transaction.userAgent && (
              <div>
                <div className="text-sm font-medium text-gray-500">User Agent</div>
                <div className="mt-1 text-sm text-gray-900 font-mono truncate" title={transaction.userAgent}>
                  {transaction.userAgent}
                </div>
              </div>
            )}
          </div>

          {transaction.remoteAddress && (
            <div>
              <div className="text-sm font-medium text-gray-500">Remote Address</div>
              <div className="mt-1 text-sm text-gray-900 font-mono">{transaction.remoteAddress}</div>
            </div>
          )}

          {/* Tags */}
          {Object.keys(tags).length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Tags</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(tags).map(([tag, value]) => (
                  <Badge key={tag} color="blue">
                    {tag}={value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Foldable>
    </div>
  );
}
