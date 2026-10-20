import type { ThemeColors } from "./ThemeColor";

/**
 * Theme tokens behind the transaction charts. Errors and cached follow the danger and success tokens, so the
 * Errors pane's ring and its chart move together.
 */
export const chartColorTokens = {
  transactions: "--color-chart-transactions",
  errors: "--color-danger-200",
  cached: "--color-success-200",
  rest: "--color-chart-rest",
  label: "--color-chart-label",
} as const;

export type ChartColors = ThemeColors<typeof chartColorTokens>;
