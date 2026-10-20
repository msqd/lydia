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
  pages = 50,
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
  const setPreviousPage = setPage ? () => setPage(Math.max(1, current - 1)) : undefined;
  const setNextPage = setPage ? () => setPage(Math.min(pages, current + 1)) : undefined;
  return (
    <div className={twMerge("flex items-center justify-between border-gray-200 bg-white px-4 py-3 sm:px-6", className)}>
      <div className="flex flex-1 justify-between sm:hidden">
        <a
          href="#"
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={(e) => {
            e.preventDefault();
            setPreviousPage?.();
          }}
        >
          Previous
        </a>
        <a
          href="#"
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={(e) => {
            e.preventDefault();
            setNextPage?.();
          }}
        >
          Next
        </a>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className={showSummary ? "" : "invisible"}>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(current - 1) * perPage + 1}</span> to{" "}
            <span className="font-medium">{total ? Math.min(current * perPage, total) : current * perPage}</span>
            {total ? (
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
            <a
              href="#"
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              onClick={(e) => {
                e.preventDefault();
                setPreviousPage?.();
              }}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </a>
            {(() => {
              const safeCurrent = Math.max(1, Math.min(current || 1, pages || 1));
              const safePages = Math.max(1, pages || 1);

              // Ensure we have valid positive integers
              if (safePages <= 0 || safeCurrent <= 0 || safeCurrent > safePages) {
                // Return a minimal valid pagination when data is invalid
                return generate(1, 1, 1, 1, "…");
              }

              return generate(safeCurrent, safePages, 1, 1, "…");
            })().map((i: string | number, index: number) => {
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
                const isCurrent = i === current;
                return (
                  <a
                    key={index}
                    href="#"
                    aria-current={isCurrent ? "page" : undefined}
                    className={
                      isCurrent
                        ? "relative z-10 inline-flex items-center bg-primary-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                        : "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }
                    onClick={
                      setPage
                        ? (e) => {
                            e.preventDefault();
                            setPage(i as number);
                          }
                        : undefined
                    }
                  >
                    {i}
                  </a>
                );
              }
            })}

            <a
              href="#"
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              onClick={(e) => {
                e.preventDefault();
                setNextPage?.();
              }}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}
