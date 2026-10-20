import type { OverviewTransaction } from "../../../Models";

export interface TooltipData {
  count: number;
  errors: number;
  cached: number;
  name: string;
}

export interface SplitTooltipParams {
  name: string;
  value: number;
  dataIndex?: number;
}

/**
 * Utility class for formatting chart tooltips with consistent styling and calculations
 */
export class ChartTooltipFormatter {
  /**
   * Format percentage with consistent styling
   */
  private static formatPercentage(numerator: number, denominator: number): string {
    if (!denominator) return "n/a";
    return (numerator / denominator).toLocaleString(undefined, {
      style: "percent",
      minimumFractionDigits: 1,
    });
  }

  /**
   * Create tooltip content for split bar charts (wide bars with separate error/cached bars)
   */
  static formatSplitBarsTooltip(params: SplitTooltipParams[]): string {
    const countSerie = params[0];
    const errorsSerie = params[1];
    const cachedSerie = params[2];

    const errorRate = ChartTooltipFormatter.formatPercentage(errorsSerie?.value || 0, countSerie?.value || 0);

    const cachedRate = ChartTooltipFormatter.formatPercentage(cachedSerie?.value || 0, countSerie?.value || 0);

    let tooltipContent = `<strong>${countSerie.name}</strong><br/>`;

    if (countSerie.value) {
      tooltipContent += `<small>Transactions: ${countSerie.value}<br/>`;
      tooltipContent += `Cached: ${cachedSerie?.value || 0} (${cachedRate})<br/>`;
      tooltipContent += `Errors: ${errorsSerie?.value || 0} (${errorRate})<br/>`;
      tooltipContent += "</small>";
    } else {
      tooltipContent += `<small>No transactions</small>`;
    }

    return tooltipContent;
  }

  /**
   * Create tooltip content for unified bar charts (stacked bars)
   */
  static formatUnifiedBarsTooltip(params: SplitTooltipParams[], data: OverviewTransaction[]): string {
    const dataIndex = params[0]?.dataIndex;
    if (dataIndex === undefined || !data[dataIndex]) {
      return `<strong>${params[0]?.name || "Unknown"}</strong><br/><small>No data available</small>`;
    }

    const transactionData = data[dataIndex];
    const { count: totalCount, errors, cached } = transactionData;

    const errorRate = ChartTooltipFormatter.formatPercentage(errors, totalCount);
    const cachedRate = ChartTooltipFormatter.formatPercentage(cached, totalCount);

    let tooltipContent = `<strong>${params[0].name}</strong><br/>`;
    tooltipContent += `<small>Transactions: ${totalCount}<br/>`;
    tooltipContent += `Cached: ${cached} (${cachedRate})<br/>`;
    tooltipContent += `Errors: ${errors} (${errorRate})<br/>`;
    tooltipContent += "</small>";

    return tooltipContent;
  }

  /**
   * Create tooltip content from transaction data directly
   */
  static formatTooltipFromData(data: TooltipData): string {
    const { count, errors, cached, name } = data;

    const errorRate = ChartTooltipFormatter.formatPercentage(errors, count);
    const cachedRate = ChartTooltipFormatter.formatPercentage(cached, count);

    let tooltipContent = `<strong>${name}</strong><br/>`;

    if (count) {
      tooltipContent += `<small>Transactions: ${count}<br/>`;
      tooltipContent += `Cached: ${cached} (${cachedRate})<br/>`;
      tooltipContent += `Errors: ${errors} (${errorRate})<br/>`;
      tooltipContent += "</small>";
    } else {
      tooltipContent += `<small>No transactions</small>`;
    }

    return tooltipContent;
  }
}
