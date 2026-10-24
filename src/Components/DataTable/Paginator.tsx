import { generate } from "@bramus/pagination-sequence";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useId } from "react";
import { twMerge } from "tailwind-merge";

export type PaginatorProps = {
  /**
   * Total number of pages
   */
  pages?: number;
  /**
   * Current page
   */
  current?: number;
  /**
   * Number of items per page
   */
  perPage?: number;
  /**
   * Total number of items
   */
  total?: number;
  /**
   * Additional className to apply
   */
  className?: string;
  /**
   * Function to set the current page
   */
  setPage?: (page: number) => void;
  /**
   * Whether to show the summary of items
   */
  showSummary?: boolean;
  /**
   * The name of its navigation landmark. A page drawing two paginators names
   * them apart, or a screen reader lists one landmark twice.
   */
  label?: string;
  /**
   * Ids of the elements whose text leads the landmark's name, ahead of `label`,
   * for a name that lives in the document rather than in a string.
   */
  labelledBy?: string;
};

export function Paginator({
  pages = 1,
  current = 1,
  perPage = 20,
  total = undefined,
  className = undefined,
  setPage = undefined,
  showSummary = true,
  label = "Pagination",
  labelledBy = undefined,
}: PaginatorProps) {
  const navId = useId();
  const lastPage = Math.max(1, pages);
  const currentPage = Math.max(1, Math.min(current, lastPage));
  const previousDisabled = !setPage || currentPage <= 1;
  const nextDisabled = !setPage || currentPage >= lastPage;
  const first = total === 0 ? 0 : (current - 1) * perPage + 1;
  const last = total === undefined ? current * perPage : Math.min(current * perPage, total);
  return (
    <div className={twMerge("flex items-center justify-between border-gray-200 bg-white px-4 py-3 sm:px-6", className)}>
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          type="button"
          disabled={previousDisabled}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          onClick={() => setPage?.(currentPage - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={nextDisabled}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          onClick={() => setPage?.(currentPage + 1)}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className={showSummary ? "" : "invisible"}>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{first}</span> to <span className="font-medium">{last}</span>
            {total !== undefined ? (
              <>
                {" "}
                of <span className="font-medium">{total}</span> results
              </>
            ) : (
              ""
            )}
          </p>
        </div>
        <div>
          <nav
            id={labelledBy && navId}
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label={label}
            aria-labelledby={labelledBy && `${labelledBy} ${navId}`}
          >
            <button
              type="button"
              disabled={previousDisabled}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              onClick={() => setPage?.(currentPage - 1)}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            {generate(currentPage, lastPage, 1, 1, "…").map((i: string | number, index: number) => {
              if (typeof i === "string") {
                return (
                  <span
                    key={index}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                  >
                    ...
                  </span>
                );
              } else {
                const isCurrent = i === currentPage;
                return (
                  <button
                    key={index}
                    type="button"
                    disabled={!setPage}
                    aria-current={isCurrent ? "page" : undefined}
                    className={
                      isCurrent
                        ? "relative z-10 inline-flex items-center bg-primary-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                        : "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    }
                    onClick={() => setPage?.(i)}
                  >
                    {i}
                  </button>
                );
              }
            })}

            <button
              type="button"
              disabled={nextDisabled}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              onClick={() => setPage?.(currentPage + 1)}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
