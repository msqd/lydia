import { memo } from "react";

export interface PerformanceData {
  /** Number of lines in the content */
  lineCount: number;
  /** Total character count */
  characterCount: number;
  /** Time taken for syntax highlighting in milliseconds */
  highlightingTime?: number;
  /** Time taken for formatting in milliseconds */
  formattingTime?: number;
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
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Formats time duration in human-readable format
 */
function formatDuration(ms: number): string {
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Component for displaying code formatting performance metrics
 * Useful for debugging and monitoring large file performance
 */
export const PerformanceMetrics = memo<PerformanceMetricsProps>(({ data, showDetails = false, className = "" }) => {
  const { lineCount, characterCount, highlightingTime, formattingTime, isVirtualized, visibleItemCount } = data;

  const fileSize = formatFileSize(characterCount);
  const totalProcessingTime = (highlightingTime || 0) + (formattingTime || 0);

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

        {/* Performance timings */}
        {totalProcessingTime > 0 && <span>Processed in {formatDuration(totalProcessingTime)}</span>}
      </div>

      {/* Detailed metrics */}
      {showDetails && (
        <div className="mt-1 flex gap-4 text-gray-400">
          {formattingTime !== undefined && <span>Format: {formatDuration(formattingTime)}</span>}
          {highlightingTime !== undefined && <span>Highlight: {formatDuration(highlightingTime)}</span>}
          {isVirtualized && <span>Virtual rendering enabled</span>}
        </div>
      )}
    </div>
  );
});

PerformanceMetrics.displayName = "PerformanceMetrics";
