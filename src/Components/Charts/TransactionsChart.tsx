import { BarChart } from "echarts/charts";
import { DatasetComponent, GridComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useMemo } from "react";
import { ReactEChartsCore } from "./Utils/ReactEChartsCore";

import type { OverviewTransaction } from "../../Models";
import { defaultEchartOptions } from "../../Settings";
import { createThinBarSeries } from "./Components/ThinBarChart";
import { createWideBarSeries } from "./Components/WideBarChart";
import { useChartDimensions } from "./Hooks/useChartDimensions";
import { useThemeColors } from "./Hooks/useThemeColors";
import { ChartBarCalculator } from "./Utils/ChartBarCalculator";
import { chartColorTokens } from "./Utils/ChartColors";
import { ChartTooltipFormatter } from "./Utils/ChartTooltipFormatter";
import { TimeFormatter } from "./Utils/TimeFormatter";

// Register the required components
echarts.use([BarChart, CanvasRenderer, GridComponent, TooltipComponent, TitleComponent, DatasetComponent]);

interface TransactionsChartProps {
  data: Array<OverviewTransaction>;
  timeRange?: string;
}

const labelOption = {
  show: true,
  rotate: 90,
  formatter: "{c}",
  fontSize: 12,
  rich: {
    name: {},
  },
};

const TransactionsChart = ({ data, timeRange }: TransactionsChartProps) => {
  const { containerRef, dimensions } = useChartDimensions({
    defaultWidth: 600,
    defaultHeight: 300,
    padding: { left: 40, right: 40, top: 20, bottom: 40 },
  });

  const colors = useThemeColors(chartColorTokens);

  const echartOptions = useMemo(() => {
    // Calculate responsive configuration using chart dimensions
    const barConfig = ChartBarCalculator.calculateBarConfig({
      dataLength: data.length,
      chartAreaWidth: dimensions.chartAreaWidth,
      containerWidth: dimensions.containerWidth,
    });

    // Create series based on bar configuration
    const createSeries = () => {
      if (barConfig.useSplitBars) {
        return createWideBarSeries({ data, barConfig, labelOption: { ...labelOption, color: colors.label }, colors });
      } else {
        return createThinBarSeries({ data, barConfig, colors });
      }
    };

    return {
      ...defaultEchartOptions,
      xAxis: {
        type: "category",
        data: data.map((x) => TimeFormatter.formatTick(x.datetime, timeRange)),
      },
      yAxis: {
        type: "value",
        min: 0,
      },
      tooltip: {
        ...defaultEchartOptions.tooltip,
        formatter: barConfig.useSplitBars
          ? ChartTooltipFormatter.formatSplitBarsTooltip
          : (params: any[]) => ChartTooltipFormatter.formatUnifiedBarsTooltip(params, data),
      },
      series: createSeries(),
    };
  }, [data, timeRange, dimensions.chartAreaWidth, dimensions.containerWidth, colors]);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <ReactEChartsCore
        echarts={echarts}
        option={echartOptions}
        notMerge={true}
        lazyUpdate={true}
        opts={{ height: 300, width: "auto" }}
      />
    </div>
  );
};

export default TransactionsChart;
