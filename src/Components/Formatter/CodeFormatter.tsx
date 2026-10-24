import { type ComponentProps, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { BodyNotice } from "./BodyNotice";
import { type PerformanceData, PerformanceMetrics } from "./PerformanceMetrics";
import { LINE_HEIGHT, VIRTUALIZATION_THRESHOLD, VirtualizedCodeView } from "./VirtualizedCodeView";
import { type CodeLanguage, useCodeHighlighting } from "./useCodeHighlighting";

/** Vertical padding of the code box (`p-3`) in pixels. */
const PADDING = 24;

export interface CodeFormatterProps extends Omit<ComponentProps<"div">, "onChange"> {
  /**
   * The code to format and display
   */
  code: string;

  /**
   * The programming language for syntax highlighting
   */
  language?: CodeLanguage;

  /**
   * Whether to show line numbers
   */
  showLineNumbers?: boolean;

  /**
   * Whether to enable virtualization for large files
   */
  virtualized?: boolean;

  /**
   * Height of the code container (required for virtualization)
   */
  height?: number;

  /**
   * Performance metrics detail level.
   */
  performance?: "none" | "summary" | "detailed";

  /**
   * Maximum height before scrolling is enabled
   */
  maxHeight?: number;

  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * Enhanced code formatter component with syntax highlighting and virtualization
 *
 * Features:
 * - Syntax highlighting for multiple languages
 * - Virtualization for large files (>50 lines)
 * - Performance metrics display
 * - Line numbers support
 * - Responsive design
 */
export function CodeFormatter({
  code,
  language = "text",
  showLineNumbers = false,
  virtualized = true,
  height = 400,
  performance = "none",
  maxHeight = 600,
  className,
  ...props
}: CodeFormatterProps) {
  const showPerformance = performance !== "none";
  const showDetailedPerformance = performance === "detailed";

  const { formattedContent, lines, highlightLine, tooLargeToHighlight } = useCodeHighlighting(code, language);

  const performanceData = useMemo(
    (): PerformanceData => ({
      lineCount: lines.length,
      characterCount: formattedContent.length,
      isVirtualized: virtualized && lines.length > VIRTUALIZATION_THRESHOLD,
      visibleItemCount: virtualized ? Math.min(Math.floor(height / LINE_HEIGHT), lines.length) : undefined,
    }),
    [formattedContent, lines, virtualized, height],
  );

  const containerHeight = virtualized ? height : Math.min(lines.length * LINE_HEIGHT + PADDING, maxHeight);

  return (
    <div className={twMerge("border border-gray-200 rounded-md overflow-hidden bg-white", className)} {...props}>
      {showPerformance && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <PerformanceMetrics data={performanceData} showDetails={showDetailedPerformance} />
        </div>
      )}

      {tooLargeToHighlight && <BodyNotice>Too large to highlight: shown as plain text.</BodyNotice>}

      <div className="relative">
        <VirtualizedCodeView
          lines={lines}
          highlightLine={highlightLine}
          containerHeight={containerHeight}
          showLineNumbers={showLineNumbers}
          virtualized={virtualized}
          className="p-3"
        />
      </div>
    </div>
  );
}

export default CodeFormatter;
