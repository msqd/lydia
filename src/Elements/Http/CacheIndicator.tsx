import { XMarkIcon } from "@heroicons/react/20/solid";
import { CircleStackIcon } from "@heroicons/react/24/outline";
import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface CacheIndicatorProps extends ComponentProps<"span"> {
  /** Cache status from the server */
  cacheStatus?: "hit" | "miss" | "stale" | "bypass";
  /** Whether the request was cached (legacy support) */
  cached?: boolean;
  /** Size of the indicator */
  size?: "xs" | "sm" | "base" | "lg";
}

/**
 * CacheIndicator component that displays cache status using icons.
 * - No icon for cache miss (default behavior)
 * - Green database icon for cache hit
 * - Red crossed-out database icon for cache bypass
 * - Yellow database icon for stale cache
 */
export function CacheIndicator({ cacheStatus, cached, size = "xs", className, ...props }: CacheIndicatorProps) {
  // Determine the cache status
  let effectiveStatus: "hit" | "miss" | "stale" | "bypass" | null = null;

  if (cacheStatus) {
    effectiveStatus = cacheStatus;
  } else if (cached === true) {
    effectiveStatus = "hit";
  } else if (cached === false) {
    effectiveStatus = "miss";
  }

  // Don't show icon for cache miss (default behavior)
  if (!effectiveStatus || effectiveStatus === "miss") {
    return null;
  }

  // Determine styling based on status
  let colorClass: string;
  let title: string;
  let showCrossOut = false;

  switch (effectiveStatus) {
    case "hit":
      colorClass = "text-success-600";
      title = "Cache HIT - Response served from cache";
      break;
    case "stale":
      colorClass = "text-warning-600";
      title = "Cache STALE - Served stale content while revalidating";
      break;
    case "bypass":
      colorClass = "text-danger-600";
      title = "Cache BYPASS - Cache was intentionally bypassed";
      showCrossOut = true;
      break;
    default:
      return null;
  }

  // Map size to appropriate icon size classes (smaller overall)
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    base: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={twMerge("inline-flex items-center cursor-help relative", className)}
      title={title}
      // An image, so the label has a role to name: on a bare span it was
      // prohibited, and nothing read it.
      role="img"
      aria-label={title}
      {...props}
    >
      <CircleStackIcon className={twMerge(sizeClasses[size], colorClass)} aria-hidden="true" />
      {showCrossOut && (
        <XMarkIcon className={twMerge("absolute inset-0", sizeClasses[size], colorClass)} aria-hidden="true" />
      )}
    </span>
  );
}
