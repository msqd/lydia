/** How a status reads at a glance. A subset of what a badge can be coloured, so it can be handed to one. */
export type StatusTone = "success" | "warning" | "danger" | "default";

// Health status types
export type HealthStatus = "healthy" | "degraded" | "unhealthy";

// Circuit breaker status types
export type CircuitBreakerStatus = "open" | "closed" | "half-open";

// Generic status union type that could be extended
export type SystemStatus = HealthStatus | CircuitBreakerStatus;

// Configuration for health status display
export interface HealthStatusConfig {
  color: StatusTone;
  label: string;
  description?: string;
}

// Configuration for circuit breaker status display
export interface CircuitBreakerStatusConfig {
  color: StatusTone;
  icon: string;
  label: string;
  description: string;
}

// Maps for status configurations
export const healthStatusMap: Record<HealthStatus, HealthStatusConfig> = {
  healthy: {
    color: "success",
    label: "Healthy",
    description: "Service is operating normally",
  },
  degraded: {
    color: "warning",
    label: "Degraded",
    description: "Service is experiencing issues",
  },
  unhealthy: {
    color: "danger",
    label: "Unhealthy",
    description: "Service is not responding",
  },
} as const;

export const circuitBreakerStatusMap: Record<CircuitBreakerStatus, CircuitBreakerStatusConfig> = {
  closed: {
    color: "success",
    icon: "●",
    label: "Closed",
    description: "Normal operation",
  },
  "half-open": {
    color: "warning",
    icon: "◐",
    label: "Half-Open",
    description: "Testing recovery",
  },
  open: {
    color: "danger",
    icon: "○",
    label: "Open",
    description: "Blocking requests",
  },
} as const;

// Type guards
export function isHealthStatus(status: string): status is HealthStatus {
  return status === "healthy" || status === "degraded" || status === "unhealthy";
}

export function isCircuitBreakerStatus(status: string): status is CircuitBreakerStatus {
  return status === "open" || status === "closed" || status === "half-open";
}

// Helper function to get color for any status
export function getStatusColor(status: SystemStatus): StatusTone {
  if (isHealthStatus(status)) {
    return healthStatusMap[status].color;
  }
  if (isCircuitBreakerStatus(status)) {
    return circuitBreakerStatusMap[status].color;
  }
  return "default"; // fallback
}
