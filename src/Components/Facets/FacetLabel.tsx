import { type ReactNode } from "react";
import { FacetCount } from "./FacetCount";

export interface FacetLabelProps {
  /** The main text/value to display */
  name: string;
  /** Optional count to show in parentheses */
  count?: number;
  /** Optional children (like "only" button) */
  children?: ReactNode;
}

/**
 * FacetLabel component that displays a filter option with its name, count, and optional action buttons.
 */
export function FacetLabel({ name, count, children }: FacetLabelProps) {
  return (
    <div className="flex items-center justify-between w-full group">
      <span className="truncate">{name}</span>
      <div className="flex items-center space-x-2 ml-auto">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">{children}</div>
        {count !== undefined && <FacetCount count={count} />}
      </div>
    </div>
  );
}
