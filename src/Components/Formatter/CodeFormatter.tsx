import { type ComponentProps, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { type PerformanceData, PerformanceMetrics } from "./PerformanceMetrics";
import { VIRTUALIZATION_THRESHOLD, VirtualizedCodeView } from "./VirtualizedCodeView";
import { type CodeLanguage, useCodeHighlighting } from "./useCodeHighlighting";

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
  const [performanceStartTime] = useState(Date.now);

  // Only a virtualized view short enough not to virtualize draws the highlighted tree.
  const { formattedContent, highlightedAST, isHighlighted } = useCodeHighlighting(code, language, {
    enabled: virtualized,
    maxLines: VIRTUALIZATION_THRESHOLD,
  });

  // Calculate performance metrics
  const performanceData = useMemo((): PerformanceData => {
    const lines = formattedContent.split("\n");
    const processingTime = Date.now() - performanceStartTime;

    return {
      lineCount: lines.length,
      characterCount: formattedContent.length,
      highlightingTime: isHighlighted ? processingTime : undefined,
      formattingTime: language === "json" ? processingTime : undefined,
      isVirtualized: virtualized && lines.length > VIRTUALIZATION_THRESHOLD,
      visibleItemCount: virtualized ? Math.min(Math.floor(height / 20), lines.length) : undefined,
    };
  }, [formattedContent, language, isHighlighted, virtualized, height, performanceStartTime]);

  // Determine container height
  const containerHeight = useMemo(() => {
    if (virtualized) return height;

    const lineCount = formattedContent.split("\n").length;
    const calculatedHeight = lineCount * 20; // 20px per line
    return Math.min(calculatedHeight, maxHeight);
  }, [formattedContent, virtualized, height, maxHeight]);

  return (
    <div className={twMerge("border border-gray-200 rounded-md overflow-hidden bg-white", className)} {...props}>
      {/* Header with performance metrics */}
      {showPerformance && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <PerformanceMetrics data={performanceData} showDetails={showDetailedPerformance} />
        </div>
      )}

      {/* Code content */}
      <div className="relative">
        {virtualized ? (
          <VirtualizedCodeView
            content={formattedContent}
            highlightedAST={highlightedAST}
            containerHeight={containerHeight}
            showLineNumbers={showLineNumbers}
            className="p-3"
          />
        ) : (
          <div className="p-3 overflow-auto" style={{ maxHeight: containerHeight }}>
            <div className="font-mono text-xs leading-5 whitespace-pre">{formattedContent}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeFormatter;
