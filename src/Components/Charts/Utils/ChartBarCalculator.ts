export interface BarConfiguration {
  mainBarWidth: string;
  detailBarWidth: string;
  showLabels: boolean;
  useSplitBars: boolean;
  calculatedWidth: number;
  barGap: string;
}

export interface BarCalculatorOptions {
  dataLength: number;
  chartAreaWidth: number;
  containerWidth: number;
  wideBarGapWidth?: number;
  thinBarGapWidth?: number;
  minBarWidth?: number;
  maxBarWidth?: number;
  detailBarWidthRatio?: number;
}

/**
 * Utility class for calculating responsive bar chart configurations
 */
export class ChartBarCalculator {
  private static readonly DEFAULT_WIDE_GAP = 4;
  private static readonly DEFAULT_THIN_GAP = 2;
  private static readonly DEFAULT_MIN_WIDTH = 3;
  private static readonly DEFAULT_MAX_WIDTH = 38;
  private static readonly DEFAULT_DETAIL_RATIO = 0.3;

  /**
   * Calculate responsive bar configuration based on data length and container dimensions
   */
  static calculateBarConfig(options: BarCalculatorOptions): BarConfiguration {
    const {
      dataLength,
      chartAreaWidth,
      containerWidth,
      wideBarGapWidth = this.DEFAULT_WIDE_GAP,
      thinBarGapWidth = this.DEFAULT_THIN_GAP,
      minBarWidth = this.DEFAULT_MIN_WIDTH,
      maxBarWidth = this.DEFAULT_MAX_WIDTH,
      detailBarWidthRatio = this.DEFAULT_DETAIL_RATIO,
    } = options;

    // Try both configurations and see which one works better
    const wideBarConfig = this.calculateWideBarConfig({
      dataLength,
      chartAreaWidth,
      gapWidth: wideBarGapWidth,
      minBarWidth,
      maxBarWidth,
    });

    const thinBarConfig = this.calculateThinBarConfig({
      dataLength,
      chartAreaWidth,
      gapWidth: thinBarGapWidth,
      minBarWidth,
      maxBarWidth,
    });

    // Check if wide bars would actually fit without overlapping
    const detailBarWidth = Math.max(2, wideBarConfig.barWidth * detailBarWidthRatio);
    const totalBarGroupWidth = wideBarConfig.barWidth + detailBarWidth;
    const totalSpaceNeededForWideBars = totalBarGroupWidth * dataLength + wideBarConfig.totalGapSpace;

    // Decision: Use wide bars if:
    // 1. Main bar would be at least 16px wide, AND
    // 2. Total space needed (main + detail bars + gaps) fits in available space
    const useWideBars = wideBarConfig.barWidth >= 16 && totalSpaceNeededForWideBars <= chartAreaWidth;

    const finalConfig = useWideBars ? wideBarConfig : thinBarConfig;
    const finalDetailBarWidth = useWideBars ? detailBarWidth : 0;

    return {
      mainBarWidth: `${finalConfig.barWidth}px`,
      detailBarWidth: useWideBars ? `${finalDetailBarWidth}px` : "0px",
      showLabels: this.shouldShowLabels({
        useWideBars,
        dataLength,
        containerWidth,
        barWidth: finalConfig.barWidth,
      }),
      useSplitBars: useWideBars,
      calculatedWidth: finalConfig.barWidth,
      barGap: `${finalConfig.gapWidth}px`,
    };
  }

  private static calculateWideBarConfig(options: {
    dataLength: number;
    chartAreaWidth: number;
    gapWidth: number;
    minBarWidth: number;
    maxBarWidth: number;
  }) {
    const { dataLength, chartAreaWidth, gapWidth, minBarWidth, maxBarWidth } = options;

    const totalGapSpace = (dataLength - 1) * gapWidth;
    const availableBarSpace = chartAreaWidth - totalGapSpace;
    const maxPossibleBarWidth = Math.floor(availableBarSpace / dataLength);
    const constrainedBarWidth = Math.max(minBarWidth, Math.min(maxBarWidth, maxPossibleBarWidth));

    return {
      barWidth: constrainedBarWidth,
      gapWidth,
      totalGapSpace,
    };
  }

  private static calculateThinBarConfig(options: {
    dataLength: number;
    chartAreaWidth: number;
    gapWidth: number;
    minBarWidth: number;
    maxBarWidth: number;
  }) {
    const { dataLength, chartAreaWidth, gapWidth, minBarWidth, maxBarWidth } = options;

    const totalGapSpace = (dataLength - 1) * gapWidth;
    const availableBarSpace = chartAreaWidth - totalGapSpace;
    const maxPossibleBarWidth = Math.floor(availableBarSpace / dataLength);
    const constrainedBarWidth = Math.max(minBarWidth, Math.min(maxBarWidth, maxPossibleBarWidth));

    return {
      barWidth: constrainedBarWidth,
      gapWidth,
      totalGapSpace,
    };
  }

  private static shouldShowLabels(options: {
    useWideBars: boolean;
    dataLength: number;
    containerWidth: number;
    barWidth: number;
  }): boolean {
    const { useWideBars, dataLength, containerWidth, barWidth } = options;

    // Never show labels if using thin bars (not split display)
    if (!useWideBars) return false;

    // For containers smaller than 400px, be more conservative with labels
    if (containerWidth < 400) {
      return dataLength <= 12 && barWidth >= 12;
    }

    // For medium containers (400-600px), allow more labels
    if (containerWidth < 600) {
      return dataLength <= 20 && barWidth >= 10;
    }

    // For larger containers (600px+), be more permissive
    return dataLength <= 30 && barWidth >= 16;
  }
}
