import type { HttpHeader } from "@msqd/lydia/Models/Http/headers";
import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type { HttpHeader };

export interface HeadersDisplayProps extends ComponentProps<"div"> {
  /** Rendered in the order given, one row per occurrence. Never sorted, grouped or deduplicated. */
  headers: HttpHeader[];
  className?: string;
}

export function HeadersDisplay({ headers, className, ...props }: HeadersDisplayProps) {
  if (headers.length === 0) {
    return (
      <div className={twMerge("text-gray-500 text-xs italic", className)} {...props}>
        No headers
      </div>
    );
  }

  return (
    <div className={twMerge("font-mono text-xs", className)} {...props}>
      {headers.map(({ name, value }, index) => (
        // Position is the only stable identity: the same name may legitimately appear many times.
        <div key={`${index}-${name}`} className="flex">
          <span className="text-gray-600 mr-2">{name}:</span>
          <span className="text-gray-900 break-all">{value}</span>
        </div>
      ))}
    </div>
  );
}
