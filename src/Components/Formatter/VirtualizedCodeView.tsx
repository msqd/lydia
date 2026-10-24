import { memo, useMemo } from "react";
import { SyntaxHighlighter, type SyntaxTree } from "./SyntaxHighlighter";
import { useVirtualization } from "./useVirtualization";

/** Above this many lines the view only draws the lines in view. */
export const VIRTUALIZATION_THRESHOLD = 50;

/** Height of a code line in pixels (`text-xs` with `leading-5`). */
export const LINE_HEIGHT = 20;

export interface VirtualizedCodeViewProps {
  /** The formatted content, one entry per line */
  lines: string[];
  /** Highlights one line; lines are drawn as plain text without it */
  highlightLine?: (line: string) => SyntaxTree | null;
  /** Height of the container in pixels */
  containerHeight: number;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Whether to draw only the lines in view above `VIRTUALIZATION_THRESHOLD` lines */
  virtualized?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Renders code line by line, highlighting and drawing only the lines in view
 * when there are many. Short bodies are drawn whole through the same path.
 */
export const VirtualizedCodeView = memo<VirtualizedCodeViewProps>(
  ({ lines, highlightLine, containerHeight, showLineNumbers = false, virtualized = true, className = "" }) => {
    const virtualizationConfig = useMemo(
      () => ({
        itemHeight: LINE_HEIGHT,
        containerHeight,
        overscan: 10,
        virtualizationThreshold: virtualized ? VIRTUALIZATION_THRESHOLD : Number.POSITIVE_INFINITY,
      }),
      [containerHeight, virtualized],
    );

    const { isVirtualized, startIndex, endIndex, totalHeight, offsetY, onScroll } = useVirtualization(
      lines.length,
      virtualizationConfig,
    );

    const visibleLines = useMemo(
      () =>
        lines.slice(startIndex, endIndex + 1).map((line, index) => {
          const lineIndex = startIndex + index;
          const tree = highlightLine?.(line);
          return (
            <div key={lineIndex} className="font-mono text-xs leading-5 whitespace-pre" style={{ height: LINE_HEIGHT }}>
              {showLineNumbers && (
                <span className="text-gray-500 select-none mr-3">{String(lineIndex + 1).padStart(4, " ")}</span>
              )}
              {tree ? <SyntaxHighlighter ast={tree} /> : line}
            </div>
          );
        }),
      [lines, startIndex, endIndex, highlightLine, showLineNumbers],
    );

    // The box scrolls and holds nothing focusable, so without a tab stop a
    // keyboard cannot scroll it (WCAG 2.1.1). Named, so the stop says what it is;
    // a group rather than a region, since a page holds several and a landmark
    // per code block would crowd the landmark list.
    return (
      <div
        className={`overflow-auto ${className}`}
        style={{ height: containerHeight }}
        onScroll={onScroll}
        tabIndex={0}
        role="group"
        aria-label="Code"
      >
        <div style={isVirtualized ? { height: totalHeight, position: "relative" } : undefined}>
          <div style={isVirtualized ? { transform: `translateY(${offsetY}px)` } : undefined}>{visibleLines}</div>
        </div>
      </div>
    );
  },
);

VirtualizedCodeView.displayName = "VirtualizedCodeView";
