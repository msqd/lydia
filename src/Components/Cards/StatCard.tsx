import { type ComponentProps, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface StatCardProps extends ComponentProps<"div"> {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  className?: string;
}

export function StatCard({ title, value, unit, icon, trend, className, ...props }: StatCardProps) {
  // Determine trend color
  const trendColor = trend
    ? trend.direction === "up"
      ? "text-success-700"
      : trend.direction === "down"
        ? "text-danger-700"
        : "text-gray-500"
    : "";

  const trendIcon = trend ? (trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→") : null;

  return (
    <div className={twMerge("flex flex-col", className)} {...props}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="mt-1 flex items-baseline">
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        {unit && <div className="ml-1 text-sm font-medium text-gray-500">{unit}</div>}
      </div>
      {trend && (
        <div className="mt-2">
          <span className={`text-sm ${trendColor} flex items-center`}>
            <span className="mr-1">{trendIcon}</span>
            <span className={`font-medium ${trendColor}`}>{trend.value}%</span>
            {trend.label && <span className="ml-1 text-gray-500">{trend.label}</span>}
          </span>
        </div>
      )}
    </div>
  );
}
