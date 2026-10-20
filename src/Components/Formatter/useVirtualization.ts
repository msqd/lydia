import { useCallback, useEffect, useRef, useState } from "react";

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
  /** Scroll handler for container */
  onScroll: (e: React.UIEvent<HTMLElement>) => void;
  /** Ref for the container element */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Custom hook for virtualizing long lists of items
 * Improves performance when rendering large amounts of content
 */
export function useVirtualization(totalItems: number, config: VirtualizationConfig): VirtualizationResult {
  const { itemHeight, containerHeight, overscan = 5, virtualizationThreshold = 100 } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Only virtualize if we have enough items to benefit from it
  const isVirtualized = totalItems > virtualizationThreshold;

  // Calculate visible range based on scroll position
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(totalItems - 1, Math.ceil((scrollTop + containerHeight) / itemHeight));

  // Add overscan buffer for smooth scrolling
  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(totalItems - 1, visibleEnd + overscan);

  // Calculate total height and offset for positioning
  const totalHeight = totalItems * itemHeight;
  const offsetY = startIndex * itemHeight;

  // Handle scroll events with throttling for performance
  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
  }, []);

  // Sync external scroll changes (e.g., programmatic scrolling)
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const handleScroll = () => setScrollTop(container.scrollTop);

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return {
    isVirtualized,
    startIndex: isVirtualized ? startIndex : 0,
    endIndex: isVirtualized ? endIndex : totalItems - 1,
    totalHeight: isVirtualized ? totalHeight : containerHeight,
    offsetY: isVirtualized ? offsetY : 0,
    onScroll,
    containerRef,
  };
}
