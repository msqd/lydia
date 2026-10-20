import { useEffect, useRef, useState } from "react";

export interface ChartDimensions {
  containerWidth: number;
  containerHeight: number;
  chartAreaWidth: number;
  chartAreaHeight: number;
}

export interface UseChartDimensionsOptions {
  defaultWidth?: number;
  defaultHeight?: number;
  padding?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  debounceMs?: number;
}

/**
 * Hook for tracking responsive chart dimensions with debounced resize handling
 */
export function useChartDimensions(options: UseChartDimensionsOptions = {}) {
  const {
    defaultWidth = 600,
    defaultHeight = 300,
    padding = { left: 40, right: 40, top: 20, bottom: 40 },
    debounceMs = 100,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    containerWidth: defaultWidth,
    containerHeight: defaultHeight,
    chartAreaWidth: defaultWidth - (padding.left || 0) - (padding.right || 0),
    chartAreaHeight: defaultHeight - (padding.top || 0) - (padding.bottom || 0),
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        const containerWidth = offsetWidth || defaultWidth;
        const containerHeight = offsetHeight || defaultHeight;

        setDimensions({
          containerWidth,
          containerHeight,
          chartAreaWidth: containerWidth - (padding.left || 0) - (padding.right || 0),
          chartAreaHeight: containerHeight - (padding.top || 0) - (padding.bottom || 0),
        });
      }
    };

    // Debounce resize events to avoid excessive recalculations
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateDimensions, debounceMs);
    };

    // Initial measurement
    updateDimensions();

    // Use ResizeObserver for more accurate container tracking if available
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(debouncedResize);
      resizeObserver.observe(containerRef.current);
    }

    // Fallback to window resize for older browsers
    window.addEventListener("resize", debouncedResize);

    return () => {
      clearTimeout(resizeTimeout);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", debouncedResize);
    };
  }, [defaultWidth, defaultHeight, padding.left, padding.right, padding.top, padding.bottom, debounceMs]);

  return {
    containerRef,
    dimensions,
  };
}
