import { useCallback, useState } from "react";

export interface VirtualizationConfig {
  /** Item height in pixels */
  itemHeight: number;
  /** Container height in pixels */
  containerHeight: number;
  /** Number of items to render outside visible area for smooth scrolling */
  overscan?: number;
  /** Threshold for enabling virtualization */
  virtualizationThreshold?: number;
}

export interface VirtualizationResult {
  /** Whether virtualization is enabled */
  isVirtualized: boolean;
  /** Start index of visible items */
  startIndex: number;
  /** End index of visible items */
  endIndex: number;
  /** Total height of virtual content */
  totalHeight: number;
  /** Offset from top for positioning */
  offsetY: number;
  /** Scroll handler for the scrolling container */
  onScroll: (e: React.UIEvent<HTMLElement>) => void;
}

/**
 * Custom hook for virtualizing long lists of items
 * Improves performance when rendering large amounts of content
 */
export function useVirtualization(totalItems: number, config: VirtualizationConfig): VirtualizationResult {
  const { itemHeight, containerHeight, overscan = 5, virtualizationThreshold = 100 } = config;

  // The first row in view, not the pixel offset: scrolling within a row renders nothing.
  const [scrolledRow, setScrolledRow] = useState(0);
  const firstRow = Math.min(scrolledRow, Math.max(0, totalItems - 1));

  // Only virtualize if we have enough items to benefit from it
  const isVirtualized = totalItems > virtualizationThreshold;

  const visibleEnd = Math.min(totalItems - 1, firstRow + Math.ceil(containerHeight / itemHeight));

  // Add overscan buffer for smooth scrolling
  const startIndex = Math.max(0, firstRow - overscan);
  const endIndex = Math.min(totalItems - 1, visibleEnd + overscan);

  const totalHeight = totalItems * itemHeight;
  const offsetY = startIndex * itemHeight;

  // The single scroll subscription: React's handler also sees programmatic scrolls.
  const onScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => setScrolledRow(Math.floor(e.currentTarget.scrollTop / itemHeight)),
    [itemHeight],
  );

  return {
    isVirtualized,
    startIndex: isVirtualized ? startIndex : 0,
    endIndex: isVirtualized ? endIndex : totalItems - 1,
    totalHeight: isVirtualized ? totalHeight : containerHeight,
    offsetY: isVirtualized ? offsetY : 0,
    onScroll,
  };
}
