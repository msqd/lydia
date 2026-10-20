import { memo, useMemo } from "react";
import { SyntaxHighlighter } from "./SyntaxHighlighter";
import { useVirtualization } from "./useVirtualization";

/**
 * Above this many lines the view virtualizes, and a virtualized view draws
 * plain text: the highlighted tree is not split by line.
 */
export const VIRTUALIZATION_THRESHOLD = 50;

interface VirtualizedCodeViewProps {
  /** The formatted content to display */
  content: string;
  /** Optional syntax tree for highlighting */
  highlightedAST?: any | null;
  /** Height of the container in pixels */
  containerHeight: number;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Component for efficiently rendering large code files using virtualization
 * Only renders visible lines plus a small buffer for optimal performance
 */
export const VirtualizedCodeView = memo<VirtualizedCodeViewProps>(
  ({ content, highlightedAST, containerHeight, showLineNumbers = false, className = "" }) => {
    // Split content into lines for virtualization
    const lines = useMemo(() => content.split("\n"), [content]);

    // Configuration for virtualization
    const virtualizationConfig = useMemo(
      () => ({
        itemHeight: 20, // 20px per line (text-xs with leading-5)
        containerHeight,
        overscan: 10, // Render 10 extra lines above/below for smooth scrolling
        virtualizationThreshold: VIRTUALIZATION_THRESHOLD,
      }),
      [containerHeight],
    );

    const { isVirtualized, startIndex, endIndex, totalHeight, offsetY, onScroll, containerRef } = useVirtualization(
      lines.length,
      virtualizationConfig,
    );

    // Get visible lines
    const visibleLines = useMemo(() => {
      if (!isVirtualized) return lines;
      return lines.slice(startIndex, endIndex + 1);
    }, [lines, startIndex, endIndex, isVirtualized]);

    // The box scrolls and holds nothing focusable, so without a tab stop a
    // keyboard cannot scroll it (WCAG 2.1.1). Named, so the stop says what it is;
    // a group rather than a region, since a page holds several and a landmark
    // per code block would crowd the landmark list.
    const scrollable = { tabIndex: 0, role: "group", "aria-label": "Code" } as const;

    // If we have syntax highlighting, we need to handle it differently
    // This is simplified - in practice, you'd need to split the AST by lines
    if (highlightedAST && !isVirtualized) {
      return (
        <div
          ref={containerRef}
          className={`overflow-auto ${className}`}
          style={{ height: containerHeight }}
          onScroll={onScroll}
          {...scrollable}
        >
          <SyntaxHighlighter ast={highlightedAST} showLineNumbers={showLineNumbers} />
        </div>
      );
    }

    // Render plain text with optional virtualization
    return (
      <div
        ref={containerRef}
        className={`overflow-auto ${className}`}
        style={{ height: containerHeight }}
        onScroll={onScroll}
        {...scrollable}
      >
        {/* Virtual spacer for total height */}
        {isVirtualized && (
          <div style={{ height: totalHeight, position: "relative" }}>
            {/* Visible content positioned correctly */}
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {visibleLines.map((line, index) => {
                const lineNumber = startIndex + index + 1;
                return (
                  <div
                    key={startIndex + index}
                    className="font-mono text-xs leading-5 whitespace-pre"
                    style={{ height: 20 }}
                  >
                    {showLineNumbers && (
                      <span className="text-gray-500 select-none mr-3">{String(lineNumber).padStart(4, " ")}</span>
                    )}
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Non-virtualized rendering */}
        {!isVirtualized && (
          <div>
            {lines.map((line, index) => (
              <div key={index} className="font-mono text-xs leading-5 whitespace-pre">
                {showLineNumbers && (
                  <span className="text-gray-500 select-none mr-3">{String(index + 1).padStart(4, " ")}</span>
                )}
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

VirtualizedCodeView.displayName = "VirtualizedCodeView";
