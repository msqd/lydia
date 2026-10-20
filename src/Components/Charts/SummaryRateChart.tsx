import { BarChart } from "echarts/charts";
import { DatasetComponent, GridComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useMemo, useRef, useState } from "react";
import { ReactEChartsCore } from "./Utils/ReactEChartsCore";

import { defaultEchartOptions } from "../../Settings";
import { useThemeColor } from "./Hooks/useThemeColors";

// Register the required components
echarts.use([BarChart, CanvasRenderer, GridComponent, TooltipComponent, TitleComponent, DatasetComponent]);

interface SummaryRateChartProps {
  data: { value: number; datetime: string }[];
  /** A CSS colour, or a theme token such as `--color-danger-200`, which follows theme changes. */
  color?: string;
}

const tooltipFormatter = (params: any[]) => {
  const serie = params[0];
  let tooltipContent = `<strong>${serie.name}</strong><br/>`;
  tooltipContent += `<small>${serie.value}</small>`;
  return tooltipContent;
};

const tickFormatter = (tick: string) => {
  const date = new Date(tick);
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

const SummaryRateChart = ({ data, color }: SummaryRateChartProps) => {
  const seriesColor = useThemeColor(color);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(300);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width || 300);
      }
    };

    // Debounce resize events to avoid excessive recalculations
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateContainerWidth, 100);
    };

    // Initial measurement
    updateContainerWidth();

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
  }, []);

  // Calculate responsive bar width based on actual container width
  const calculateBarWidth = (dataLength: number, actualContainerWidth: number): string => {
    // Use actual container width minus padding for chart area
    const chartAreaWidth = actualContainerWidth - 40; // Account for chart padding

    // Reserve space for gaps: summary charts use 2px gaps (like thin bars)
    const minGapWidth = 2;
    const totalGapSpace = (dataLength - 1) * minGapWidth; // Space needed for gaps between bars
    const availableBarSpace = chartAreaWidth - totalGapSpace; // Space available for actual bars

    // Calculate maximum possible bar width while maintaining 2px gaps
    const maxPossibleBarWidth = Math.floor(availableBarSpace / dataLength);

    // Set adaptive minimum and maximum bar widths for summary charts
    const minBarWidth = 2; // Slightly wider minimum
    const maxBarWidth = dataLength > 30 ? 10 : 19; // 25% more than original values (8->10, 15->19)

    const calculatedWidth = Math.max(minBarWidth, Math.min(maxBarWidth, maxPossibleBarWidth));
    return `${calculatedWidth}px`;
  };

  const barWidth = calculateBarWidth(data.length, containerWidth);

  const echartOptions = useMemo(
    () => ({
      ...defaultEchartOptions,
      grid: {
        ...defaultEchartOptions.grid,
        left: 8,
        right: 8,
        top: 64,
        bottom: 24,
      },
      xAxis: {
        type: "category",
        data: data.map((x) => tickFormatter(x.datetime)),
      },
      yAxis: {
        type: "value",
        min: 0, // Ensure Y-axis starts from 0, no negative values
        axisLabel: { show: false },
      },
      tooltip: {
        ...defaultEchartOptions.tooltip,
        formatter: tooltipFormatter,
      },
      series: [
        {
          data: data.map((x) => x.value),
          type: "bar",
          barWidth: barWidth, // Use calculated responsive width
          barGap: "2px", // 2px gap for summary charts
          smooth: false,
          symbol: "none",
          lineStyle: {
            width: 4,
          },
          color: seriesColor,
        },
      ],
    }),
    [data, seriesColor, containerWidth, barWidth],
  );

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <ReactEChartsCore
        echarts={echarts}
        option={echartOptions}
        notMerge={true}
        lazyUpdate={true}
        opts={{ height: 240, width: "auto" }}
      />
    </div>
  );
};

export default SummaryRateChart;
