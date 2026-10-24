# SystemPage

A network architecture visualization page that displays a map of the system topology.

## Overview

The SystemPage presents a network diagram showing traffic flow from ingresses through proxies to endpoints, with the circuit breaker status and health status each connection and endpoint carries. It renders the `topology` it is given; fetching and refreshing it is up to the consuming application.

## Architecture

### SystemPage
The page component in `src/Pages/SystemPage/SystemPage.tsx`. It takes a required `topology` prop and renders it in a `NetworkMap`.

### Elements/System Components
Network visualization components are organized in the `src/Elements/System/` namespace:

#### NetworkMap
A directed acyclic graph (DAG) visualization that displays the system architecture in a left-to-right flow:
- **Entrypoints**: Entry points with service names, ports, and paths
- **Proxies**: Middleware components with implementation details
- **Endpoints**: Backend services with health status
- **Edges**: Visible connections with circuit breaker status

#### Node Components

**EntrypointNode** - Compact entrypoint display:
- Service name (e.g., "payments")
- Port number badge
- API path pattern

**ProxyNode** - Compact proxy information:
- Proxy name
- Implementation type (HARP/Envoy)

**EndpointNode** - Compact endpoint details:
- Service name
- URL/address
- Health status badge

**CircuitBreakerStatus** - Circuit breaker visualization with two modes:
- **Full mode**: Status indicators, descriptions, failure rates
- **Compact mode**: Icon and failure rate for edge display

**NetworkEdges** - SVG-based connection visualization:
- Curved lines with arrow heads
- Circuit breaker indicators on proxy-endpoint connections
- Proper DAG layout positioning

## Features

- **Circuit breaker status**: status and failure rate on each proxy-endpoint connection
- **Service health**: visual health indicators for all endpoints
- **Network topology**: clear visualization of traffic flow
- **Responsive design**: adapts to different screen sizes

## Usage

Every example needs a `NetworkTopology`: the entrypoints, proxies and endpoints, and the connections between them.

```tsx
import { SystemPage } from "@msqd/lydia/Pages/SystemPage";
import { NetworkMap, type NetworkTopology } from "@msqd/lydia/Elements/System";

const topology: NetworkTopology = {
  entrypoints: [{ id: "ep-payments", name: "payments", port: 8080, path: "/api/payments" }],
  proxies: [{ id: "proxy-api", name: "API Gateway", implementation: "harp" }],
  endpoints: [{ id: "svc-payments", name: "Payment Service", url: "payments-svc:8080", health: "healthy" }],
  connections: [
    { from: "ep-payments", to: "proxy-api", type: "entrypoint-proxy" },
    {
      from: "proxy-api",
      to: "svc-payments",
      type: "proxy-endpoint",
      circuitBreaker: { status: "closed", failureRate: 1.2 },
    },
  ],
};

function App() {
  return <SystemPage topology={topology} />;
}

// Using the map on its own
function CustomSystemView() {
  return <NetworkMap topology={topology} />;
}
```

Individual nodes take one item of the topology:

```tsx
import { EntrypointNode } from "@msqd/lydia/Elements/System";

function CustomEntrypoint() {
  return <EntrypointNode entrypoint={{ id: "ep-1", name: "payments", port: 8080, path: "/api/payments" }} />;
}
```

## Testing

Run the tests with:
```bash
pnpm test src/Pages/SystemPage/ src/Elements/System/
```

## Storybook

Interactive documentation is built from the stories:
- Pages/SystemPage
- Elements/System/NetworkMap
- Elements/System/CircuitBreakerStatus

Build it with:
```bash
pnpm storybook
```
