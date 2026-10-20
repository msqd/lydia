import { Badge } from "@msqd/lydia/Components/Badges/Badge";
import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface CacheBadgeProps extends Omit<ComponentProps<typeof Badge>, "color"> {
  /** Cache status from the server */
  cacheStatus?: "hit" | "miss" | "stale" | "bypass";
  /** Whether the request was cached (legacy support) */
  cached?: boolean;
}

/**
 * CacheBadge component that displays the cache status of a request.
 * Shows different colors and labels based on cache status.
 */
export function CacheBadge({ cacheStatus, cached, className, ...props }: CacheBadgeProps) {
  // If no cache information provided or explicitly not cached, don't render anything
  if (!cacheStatus && (cached === undefined || cached === false)) {
    return null;
  }

  // Determine status and styling
  let status: string;
  let color: "success" | "default" | "warning" | "blue";
  let title: string;

  if (cacheStatus) {
    switch (cacheStatus) {
      case "hit":
        status = "HIT";
        color = "success";
        title = "Cache HIT";
        break;
      case "miss":
        status = "MISS";
        color = "default";
        title = "Cache MISS";
        break;
      case "stale":
        status = "STALE";
        color = "warning";
        title = "Cache STALE";
        break;
      case "bypass":
        status = "BYPASS";
        color = "blue";
        title = "Cache BYPASS";
        break;
      default:
        status = "UNKNOWN";
        color = "default";
        title = "Cache status unknown";
    }
  } else if (cached) {
    // Legacy support: if only cached boolean is provided
    status = "HIT";
    color = "success";
    title = "Cached";
  } else {
    // Should not reach here due to early return, but for safety
    return null;
  }

  return (
    <Badge color={color} className={twMerge("font-mono", className)} title={title} {...props}>
      {status}
    </Badge>
  );
}
