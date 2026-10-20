import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import type { Alert } from "./AlertsPage";

/**
 * Sample alerts for stories, tests and the demo app. Presentation components take their data as
 * props; this fixture is the mock a consumer would otherwise fetch, kept out of the component.
 */

// Generate transactions related to a specific alert
const generateAlertTransactions = (alert: Alert): Transaction[] => {
  const baseTransactions: Array<{
    url: string;
    method: string;
    client: string;
    apiName: string;
    userAgent: string;
    remoteAddress: string;
  }> = [];

  // Create transactions based on the alert type
  switch (alert.id) {
    case "1": // Transaction Failure Rate High
      baseTransactions.push(
        {
          url: "/api/payments/process",
          method: "POST",
          client: "Mobile App",
          apiName: "payments-api",
          userAgent: "PayApp/1.8.5",
          remoteAddress: "192.168.1.100",
        },
        {
          url: "/api/payments/refund",
          method: "POST",
          client: "Website",
          apiName: "payments-api",
          userAgent: "Mozilla/5.0",
          remoteAddress: "10.0.1.50",
        },
        {
          url: "/api/payments/validate",
          method: "GET",
          client: "Backend Service",
          apiName: "payments-api",
          userAgent: "PaymentValidator/2.0",
          remoteAddress: "172.16.0.25",
        },
      );
      break;
    case "2": // API Performance Degraded
      baseTransactions.push(
        {
          url: "/api/users/profile",
          method: "GET",
          client: "Mobile App",
          apiName: "users-api",
          userAgent: "MyApp/2.5.0",
          remoteAddress: "192.168.1.100",
        },
        {
          url: "/api/users/search",
          method: "GET",
          client: "Website",
          apiName: "users-api",
          userAgent: "Mozilla/5.0",
          remoteAddress: "10.0.1.50",
        },
        {
          url: "/api/users/update",
          method: "PUT",
          client: "Admin Dashboard",
          apiName: "users-api",
          userAgent: "AdminPanel/3.1.0",
          remoteAddress: "172.16.0.25",
        },
      );
      break;
    case "3": // 4xx Error Spike
      baseTransactions.push(
        {
          url: "/api/auth/login",
          method: "POST",
          client: "Mobile App",
          apiName: "auth-api",
          userAgent: "MyApp/2.5.0",
          remoteAddress: "192.168.1.100",
        },
        {
          url: "/api/auth/refresh",
          method: "POST",
          client: "Website",
          apiName: "auth-api",
          userAgent: "Mozilla/5.0",
          remoteAddress: "10.0.1.50",
        },
      );
      break;
    case "4": // 5xx Server Errors
      baseTransactions.push(
        {
          url: "/api/orders/create",
          method: "POST",
          client: "Website",
          apiName: "orders-api",
          userAgent: "Mozilla/5.0",
          remoteAddress: "10.0.1.50",
        },
        {
          url: "/api/orders/update",
          method: "PUT",
          client: "Admin Dashboard",
          apiName: "orders-api",
          userAgent: "AdminPanel/3.1.0",
          remoteAddress: "172.16.0.25",
        },
      );
      break;
    default:
      // Generic transactions for other alerts
      baseTransactions.push(
        {
          url: alert.affectedEndpoint || "/api/generic",
          method: "GET",
          client: "Mobile App",
          apiName: "generic-api",
          userAgent: "GenericApp/1.0",
          remoteAddress: "192.168.1.100",
        },
        {
          url: alert.affectedEndpoint || "/api/generic",
          method: "POST",
          client: "Website",
          apiName: "generic-api",
          userAgent: "Mozilla/5.0",
          remoteAddress: "10.0.1.50",
        },
      );
  }

  const transactions: Transaction[] = [];
  const baseTime = new Date();

  // Generate multiple transactions per base transaction
  for (let i = 0; i < (alert.transactionCount || 20); i++) {
    const baseIndex = i % baseTransactions.length;
    const base = baseTransactions[baseIndex];

    // Create timestamp going backwards in time
    const timestamp = new Date(baseTime.getTime() - i * 30 * 1000); // 30 seconds apart

    // Generate appropriate response times and status codes based on alert type
    let responseTime: number;
    let statusCode: number;
    let status: "Successful" | "Failed";

    switch (alert.id) {
      case "1": // High failure rate
        const isFailure = i % 7 === 0; // ~15% failure rate
        responseTime = isFailure ? Math.random() * 500 + 1000 : Math.random() * 300 + 50;
        statusCode = isFailure ? (Math.random() > 0.5 ? 500 : 503) : 200;
        status = isFailure ? "Failed" : "Successful";
        break;
      case "2": // Slow performance
        responseTime = Math.random() * 2000 + 1500; // 1.5-3.5 seconds
        statusCode = 200;
        status = "Successful";
        break;
      case "3": // 4xx errors
        const is4xx = i % 3 === 0; // ~33% 4xx rate for spike
        responseTime = Math.random() * 200 + 50;
        statusCode = is4xx ? 401 : 200;
        status = is4xx ? "Failed" : "Successful";
        break;
      case "4": // 5xx errors
        const is5xx = i % 12 === 0; // ~8% 5xx rate
        responseTime = is5xx ? Math.random() * 1000 + 500 : Math.random() * 300 + 50;
        statusCode = is5xx ? 500 : 200;
        status = is5xx ? "Failed" : "Successful";
        break;
      default:
        responseTime = Math.random() * 500 + 100;
        statusCode = 200;
        status = "Successful";
    }

    transactions.push({
      id: `alert-${alert.id}-tx-${i + 1}`,
      url: base.url,
      method: base.method,
      status,
      statusCode,
      timestamp: timestamp.toISOString(),
      responseTime: Math.round(responseTime),
      client: base.client,
      apiName: base.apiName,
      userAgent: base.userAgent,
      remoteAddress: base.remoteAddress,
    });
  }

  return transactions;
};

const baseAlerts: Alert[] = [
  {
    id: "1",
    name: "Transaction Failure Rate High",
    description: "Transaction failure rate for /api/payments is 15.3% (threshold: 10%)",
    status: "firing",
    severity: "critical",
    lastTriggered: "2 minutes ago",
    affectedEndpoint: "/api/payments",
    transactionCount: 142,
  },
  {
    id: "2",
    name: "API Performance Degraded",
    description: "Users API response time averages 2.4s (threshold: 1s)",
    status: "firing",
    severity: "warning",
    lastTriggered: "5 minutes ago",
    affectedEndpoint: "/api/users",
    transactionCount: 234,
  },
  {
    id: "3",
    name: "4xx Error Spike Detected",
    description: "401 Unauthorized errors increased by 340% in last 10 minutes",
    status: "expired",
    severity: "warning",
    lastTriggered: "45 minutes ago",
    affectedEndpoint: "/api/auth/login",
    transactionCount: 89,
  },
  {
    id: "4",
    name: "5xx Server Errors Rising",
    description: "500 Internal Server Error rate is 8.2% for /api/orders endpoint",
    status: "firing",
    severity: "critical",
    lastTriggered: "1 minute ago",
    affectedEndpoint: "/api/orders",
    transactionCount: 67,
  },
  {
    id: "5",
    name: "API Interface Changed",
    description: "Breaking change detected in /api/users/profile response schema",
    status: "archived",
    severity: "warning",
    lastTriggered: "2 hours ago",
    affectedEndpoint: "/api/users/profile",
    transactionCount: 156,
  },
  {
    id: "6",
    name: "Circuit Breaker Activated",
    description: "External payment service circuit breaker triggered (failure rate: 95%)",
    status: "firing",
    severity: "critical",
    lastTriggered: "30 seconds ago",
    affectedEndpoint: "/api/external/payments",
    transactionCount: 23,
  },
  {
    id: "7",
    name: "Authentication Service Slow",
    description: "Auth API response time degraded to 1.8s average",
    status: "expired",
    severity: "info",
    lastTriggered: "1 hour ago",
    affectedEndpoint: "/api/auth",
    transactionCount: 178,
  },
  {
    id: "8",
    name: "Rate Limit Breaches",
    description: "Mobile app exceeding rate limits on /api/search (429 errors)",
    status: "ignored",
    severity: "info",
    lastTriggered: "3 hours ago",
    affectedEndpoint: "/api/search",
    transactionCount: 345,
  },
  {
    id: "9",
    name: "Database Query Timeout",
    description: "Complex analytics queries timing out after 30s",
    status: "firing",
    severity: "warning",
    lastTriggered: "8 minutes ago",
    affectedEndpoint: "/api/analytics/reports",
    transactionCount: 12,
  },
  {
    id: "10",
    name: "API Gateway Health Check Failed",
    description: "Gateway health endpoint returning 503 Service Unavailable",
    status: "expired",
    severity: "critical",
    lastTriggered: "25 minutes ago",
    affectedEndpoint: "/api/health",
    transactionCount: 45,
  },
];

export const sampleAlerts: Alert[] = baseAlerts.map((alert) => ({
  ...alert,
  transactions: generateAlertTransactions(alert),
}));
