import type { OverviewTransaction } from "../../../Models";
import type { BarConfiguration } from "../Utils/ChartBarCalculator";
import { type ChartColors, chartColorTokens } from "../Utils/ChartColors";
import { resolveThemeColors } from "../Utils/ThemeColor";

export interface WideBarChartProps {
  data: OverviewTransaction[];
  barConfig: BarConfiguration;
  labelOption?: {
    show: boolean;
    rotate: number;
    formatter: string;
    fontSize: number;
    color?: string;
    rich: Record<string, any>;
  };
  /** Series colours. Omitted, they are read from the theme tokens when the series are built. */
  colors?: ChartColors;
}

/**
 * Creates series configuration for wide bar charts with separate error/cached bars
 */
export function createWideBarSeries({
  data,
  barConfig,
  labelOption,
  colors = resolveThemeColors(chartColorTokens),
}: WideBarChartProps) {
  // Wide bars: show split display with separate error/cached bars
  return [
    {
      name: "transactions",
      data: data.map((x) => x.count),
      type: "bar",
      color: colors.transactions,
      barWidth: barConfig.mainBarWidth,
      barGap: barConfig.barGap,
      label: barConfig.showLabels && labelOption ? labelOption : { show: false },
    },
    {
      name: "errors",
      data: data.map((x) => x.errors),
      type: "bar",
      barWidth: barConfig.detailBarWidth,
      barGap: "0",
      color: colors.errors,
      stack: "details",
    },
    {
      name: "cached",
      data: data.map((x) => x.cached),
      type: "bar",
      barWidth: barConfig.detailBarWidth,
      barGap: "0",
      color: colors.cached,
      stack: "details",
    },
    {
      name: "rest",
      data: data.map((x) => Math.max(0, x.count - x.errors - x.cached)),
      type: "bar",
      barWidth: barConfig.detailBarWidth,
      barGap: "0",
      color: colors.rest,
      stack: "details",
    },
  ];
}
