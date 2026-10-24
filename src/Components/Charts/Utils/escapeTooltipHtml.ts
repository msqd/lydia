import { format } from "echarts/core";

/**
 * ECharts writes a tooltip formatter's string with `innerHTML`, and chart names and values can come from
 * captured traffic. Every interpolated value goes through here. `String()` first, because ECharts hands
 * values over raw, so a string can sit in a field typed as a number.
 */
export const escapeTooltipHtml = (value: unknown): string => format.encodeHTML(String(value));
