import type { OverviewTransaction } from "../../../Models";
import { escapeTooltipHtml } from "./escapeTooltipHtml";

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
   * The Transactions / Cached / Errors block shared by every tooltip
   */
  private static formatBreakdown({ count, cached, errors }: Omit<TooltipData, "name">): string {
    const errorRate = ChartTooltipFormatter.formatPercentage(errors, count);
    const cachedRate = ChartTooltipFormatter.formatPercentage(cached, count);

    return (
      `<small>Transactions: ${escapeTooltipHtml(count)}<br/>` +
      `Cached: ${escapeTooltipHtml(cached)} (${cachedRate})<br/>` +
      `Errors: ${escapeTooltipHtml(errors)} (${errorRate})<br/>` +
      "</small>"
    );
  }

  /**
   * Create tooltip content for split bar charts (wide bars with separate error/cached bars)
   *
   * @returns HTML, with every interpolated input escaped
   */
  static formatSplitBarsTooltip(params: SplitTooltipParams[]): string {
    const [countSerie, errorsSerie, cachedSerie] = params;

    return ChartTooltipFormatter.formatTooltipFromData({
      name: countSerie.name,
      count: countSerie.value,
      errors: errorsSerie?.value || 0,
      cached: cachedSerie?.value || 0,
    });
  }

  /**
   * Create tooltip content for unified bar charts (stacked bars)
   *
   * @returns HTML, with every interpolated input escaped
   */
  static formatUnifiedBarsTooltip(params: SplitTooltipParams[], data: OverviewTransaction[]): string {
    const dataIndex = params[0]?.dataIndex;
    if (dataIndex === undefined || !data[dataIndex]) {
      return `<strong>${escapeTooltipHtml(params[0]?.name || "Unknown")}</strong><br/><small>No data available</small>`;
    }

    const { count, errors, cached } = data[dataIndex];

    return `<strong>${escapeTooltipHtml(params[0].name)}</strong><br/>${ChartTooltipFormatter.formatBreakdown({ count, errors, cached })}`;
  }

  /**
   * Create tooltip content from transaction data directly
   *
   * @returns HTML, with every interpolated input escaped
   */
  static formatTooltipFromData({ count, errors, cached, name }: TooltipData): string {
    const header = `<strong>${escapeTooltipHtml(name)}</strong><br/>`;

    return count
      ? header + ChartTooltipFormatter.formatBreakdown({ count, errors, cached })
      : `${header}<small>No transactions</small>`;
  }
}
