import type { CircuitBreakerStatus, HealthStatus } from "@msqd/lydia/Models/System";
import type { NetworkTopology } from "./NetworkMap";

/**
 * Sample network topology for stories, tests and the demo app. Presentation components take
 * their data as props; this fixture is the mock a consumer would otherwise fetch, kept out of
 * the component. Excluded from the build and the published exports.
 */
export const sampleTopology: NetworkTopology = {
  entrypoints: [
    { id: "ep-payments", name: "payments", port: 8080, path: "/api/payments" },
    { id: "ep-users", name: "users", port: 8080, path: "/api/users" },
    { id: "ep-orders", name: "orders", port: 8080, path: "/api/orders" },
    { id: "ep-admin", name: "admin", port: 9000, path: "/admin" },
  ],
  proxies: [
    { id: "proxy-api", name: "API Gateway", implementation: "harp" },
    { id: "proxy-admin", name: "Admin Proxy", implementation: "envoy" },
  ],
  endpoints: [
    { id: "svc-payments", name: "Payment Service", url: "payments-svc:8080", health: "healthy" as HealthStatus },
    { id: "svc-users", name: "User Service", url: "users-svc:8080", health: "healthy" as HealthStatus },
    { id: "svc-orders", name: "Order Service", url: "orders-svc:8080", health: "degraded" as HealthStatus },
    { id: "svc-admin", name: "Admin Service", url: "admin-svc:9000", health: "healthy" as HealthStatus },
  ],
  connections: [
    // Entrypoints to Proxies
    { from: "ep-payments", to: "proxy-api", type: "entrypoint-proxy" },
    { from: "ep-users", to: "proxy-api", type: "entrypoint-proxy" },
    { from: "ep-orders", to: "proxy-api", type: "entrypoint-proxy" },
    { from: "ep-admin", to: "proxy-admin", type: "entrypoint-proxy" },
    // Proxies to Endpoints (with circuit breakers)
    {
      from: "proxy-api",
      to: "svc-payments",
      type: "proxy-endpoint",
      circuitBreaker: { status: "closed" as CircuitBreakerStatus, failureRate: 1.2 },
    },
    {
      from: "proxy-api",
      to: "svc-users",
      type: "proxy-endpoint",
      circuitBreaker: { status: "closed" as CircuitBreakerStatus, failureRate: 0.8 },
    },
    {
      from: "proxy-api",
      to: "svc-orders",
      type: "proxy-endpoint",
      circuitBreaker: { status: "open" as CircuitBreakerStatus, failureRate: 15.3 },
    },
    {
      from: "proxy-admin",
      to: "svc-admin",
      type: "proxy-endpoint",
      circuitBreaker: { status: "closed" as CircuitBreakerStatus, failureRate: 2.1 },
    },
  ],
};
