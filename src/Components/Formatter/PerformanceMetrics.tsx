import { memo } from "react";

export interface PerformanceData {
  /** Number of lines in the content */
  lineCount: number;
  /** Total character count */
  characterCount: number;
  /** Whether virtualization is active */
  isVirtualized: boolean;
  /** Number of visible items when virtualized */
  visibleItemCount?: number;
}

interface PerformanceMetricsProps {
  /** Performance data to display */
  data: PerformanceData;
  /** Whether to show detailed metrics */
  showDetails?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Component for displaying code formatting performance metrics
 * Useful for debugging and monitoring large file performance
 */
export const PerformanceMetrics = memo<PerformanceMetricsProps>(({ data, showDetails = false, className = "" }) => {
  const { lineCount, characterCount, isVirtualized, visibleItemCount } = data;

  const fileSize = formatFileSize(characterCount);

  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      <div className="flex gap-4 items-center">
        {/* Basic metrics */}
        <span>{lineCount} lines</span>
        <span>{fileSize}</span>

        {/* Virtualization status */}
        {isVirtualized && (
          <span className="text-blue-600">Virtualized {visibleItemCount && `(${visibleItemCount} visible)`}</span>
        )}
      </div>

      {/* Detailed metrics */}
      {showDetails && (
        <div className="mt-1 flex gap-4 text-gray-400">{isVirtualized && <span>Virtual rendering enabled</span>}</div>
      )}
    </div>
  );
});

PerformanceMetrics.displayName = "PerformanceMetrics";
