# SystemPage

A network architecture visualization page that displays a comprehensive map of the system topology.

## Overview

The SystemPage presents a network diagram showing traffic flow from ingresses through proxies to endpoints, with real-time status information for circuit breakers and service health.

## Architecture

### SystemPage
The main page component located in `src/Pages/System/SystemPage.tsx` that orchestrates the network visualization.

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

- **Real-time Monitoring**: Circuit breaker status and failure rates
- **Service Health**: Visual health indicators for all endpoints  
- **Network Topology**: Clear visualization of traffic flow
- **Responsive Design**: Adapts to different screen sizes
- **Interactive Elements**: Hover states and status indicators

## Usage

```tsx
import { SystemPage } from "@/Pages/System";
import { NetworkMap, EntrypointNode, CircuitBreakerStatus } from "@/Elements/System";

function App() {
  return <SystemPage />;
}

// Using individual components
function CustomSystemView() {
  return <NetworkMap />;
}

// Using individual nodes
function CustomEntrypoint() {
  return (
    <EntrypointNode 
      entrypoint={{
        id: "ep-1",
        name: "payments",
        port: 8080,
        path: "/api/payments"
      }} 
    />
  );
}
```

## Testing

The SystemPage includes comprehensive tests covering:
- Component rendering
- Network map display
- Circuit breaker status display
- Health status indicators
- Props handling

Run tests with:
```bash
pnpm test src/Pages/System/ src/Elements/System/
```

## Storybook

Interactive documentation available in Storybook:
- Pages/System/SystemPage variations
- Elements/System/NetworkMap component  
- Elements/System/CircuitBreakerStatus states

Access via:
```bash
pnpm storybook
```