import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, VisualMapComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useMemo } from "react";
import { ReactEChartsCore } from "./Utils/ReactEChartsCore";
import { TimeFormatter } from "./Utils/TimeFormatter";
import { escapeTooltipHtml } from "./Utils/escapeTooltipHtml";

import { getTpdexRating, tpdexScale } from "@msqd/lydia/Models/Tpdex";
import { defaultEchartOptions } from "../../Settings";
import { useThemeColor, useThemeColors } from "./Hooks/useThemeColors";

// Register the required components
echarts.use([LineChart, CanvasRenderer, GridComponent, TooltipComponent, VisualMapComponent]);

const tpdexTokens = Object.fromEntries(tpdexScale.map(({ label, token }) => [label, token]));

export interface SummaryPerformancesChartProps {
  data: { value: number; datetime: string }[];
}

// ECharts types the params of an axis tooltip formatter as a union this code does not narrow; the series shape is ours.
const tooltipFormatter = (params: any[]) => {
  const tpdexSerie = params[0];
  let tooltipContent = `<strong>${escapeTooltipHtml(tpdexSerie.name)}</strong><br/>`;
  const rating = getTpdexRating(tpdexSerie.value);
  tooltipContent += `<small>Average TPDEX: ${escapeTooltipHtml(tpdexSerie.value)} (${rating.label})</small>`;
  return tooltipContent;
};

export const SummaryPerformancesChart = ({ data }: SummaryPerformancesChartProps) => {
  const colors = useThemeColors(tpdexTokens);
  const outOfRangeColor = useThemeColor("--color-chart-out-of-range");

  const echartOptions = useMemo(
    () => ({
      ...defaultEchartOptions,
      grid: {
        ...defaultEchartOptions.grid,
        left: 8,
        right: 64,
        top: 64,
        bottom: 24,
      },
      xAxis: {
        type: "category",
        data: data.map((x) => TimeFormatter.formatTick(x.datetime, "24h")),
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: { show: false },
      },
      tooltip: {
        ...defaultEchartOptions.tooltip,
        formatter: tooltipFormatter,
      },
      series: [
        {
          data: data.map((x) => x.value),
          type: "line",
          smooth: true,
          symbol: "none",
          lineStyle: {
            width: 4,
          },
        },
      ],
      visualMap: {
        bottom: 4,
        right: 4,
        pieces: tpdexScale.map((scale, i) => {
          if (i === 0) {
            // First item (A++): from its threshold to 100
            return {
              label: scale.label,
              gte: scale.threshold,
              color: colors[scale.label],
            };
          } else if (i === tpdexScale.length - 1) {
            // Last item (G): from 0 to previous threshold
            return {
              label: scale.label,
              lt: tpdexScale[i - 1].threshold,
              gte: 0,
              color: colors[scale.label],
            };
          } else {
            // Middle items: between thresholds
            return {
              label: scale.label,
              lt: tpdexScale[i - 1].threshold,
              gte: scale.threshold,
              color: colors[scale.label],
            };
          }
        }),
        outOfRange: {
          color: outOfRangeColor,
        },
      },
    }),
    [data, colors, outOfRangeColor],
  );

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={echartOptions}
      notMerge={true}
      lazyUpdate={true}
      opts={{ height: 240, width: "auto" }}
    />
  );
};
