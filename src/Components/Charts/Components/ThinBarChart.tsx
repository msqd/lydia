import type { OverviewTransaction } from "../../../Models";
import type { BarConfiguration } from "../Utils/ChartBarCalculator";
import { type ChartColors, chartColorTokens } from "../Utils/ChartColors";
import { resolveThemeColors } from "../Utils/ThemeColor";

export interface ThinBarChartProps {
  data: OverviewTransaction[];
  barConfig: BarConfiguration;
  /** Series colours. Omitted, they are read from the theme tokens when the series are built. */
  colors?: ChartColors;
}

/**
 * Creates series configuration for thin bar charts with stacked components
 */
export function createThinBarSeries({
  data,
  barConfig,
  colors = resolveThemeColors(chartColorTokens),
}: ThinBarChartProps) {
  // Thin bars: show unified display with stacked components in single bar
  // Order: errors (bottom), cached (middle), successful (top) - same visual order as wide bars
  return [
    {
      name: "errors",
      data: data.map((x) => x.errors),
      type: "bar",
      color: colors.errors,
      barWidth: barConfig.mainBarWidth,
      barGap: barConfig.barGap,
      stack: "total",
      label: { show: false },
    },
    {
      name: "cached",
      data: data.map((x) => x.cached),
      type: "bar",
      color: colors.cached,
      barWidth: barConfig.mainBarWidth,
      stack: "total",
      label: { show: false },
    },
    {
      name: "successful",
      data: data.map((x) => Math.max(0, x.count - x.errors - x.cached)),
      type: "bar",
      color: colors.transactions,
      barWidth: barConfig.mainBarWidth,
      stack: "total",
      label: { show: false },
    },
  ];
}
