import { BarChart } from "echarts/charts";
import { DatasetComponent, GridComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useMemo } from "react";
import { ChartBarCalculator } from "./Utils/ChartBarCalculator";
import { ReactEChartsCore } from "./Utils/ReactEChartsCore";
import { TimeFormatter } from "./Utils/TimeFormatter";
import { escapeTooltipHtml } from "./Utils/escapeTooltipHtml";

import { defaultEchartOptions } from "../../Settings";
import { useChartDimensions } from "./Hooks/useChartDimensions";
import { useThemeColor } from "./Hooks/useThemeColors";

// Register the required components
echarts.use([BarChart, CanvasRenderer, GridComponent, TooltipComponent, TitleComponent, DatasetComponent]);

interface SummaryRateChartProps {
  data: { value: number; datetime: string }[];
  /** A CSS colour, or a theme token such as `--color-danger-200`, which follows theme changes. */
  color?: string;
}

// ECharts types the params of an axis tooltip formatter as a union this code does not narrow; the series shape is ours.
const tooltipFormatter = (params: any[]) => {
  const serie = params[0];
  let tooltipContent = `<strong>${escapeTooltipHtml(serie.name)}</strong><br/>`;
  tooltipContent += `<small>${escapeTooltipHtml(serie.value)}</small>`;
  return tooltipContent;
};

const chartPadding = { left: 20, right: 20 };

const SummaryRateChart = ({ data, color }: SummaryRateChartProps) => {
  const seriesColor = useThemeColor(color);
  const { containerRef, dimensions } = useChartDimensions({ defaultWidth: 300, padding: chartPadding });

  // Summary charts use 2px gaps, like thin bars.
  const { barWidth } = ChartBarCalculator.calculateBarSizing({
    dataLength: data.length,
    chartAreaWidth: dimensions.chartAreaWidth,
    gapWidth: 2,
    minBarWidth: 2,
    maxBarWidth: data.length > 30 ? 10 : 19,
  });

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
        data: data.map((x) => TimeFormatter.formatTick(x.datetime, "24h")),
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
          barWidth: `${barWidth}px`,
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
    [data, seriesColor, barWidth],
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
