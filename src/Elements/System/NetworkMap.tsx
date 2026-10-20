import { Card } from "@msqd/lydia/Components/Cards";
import type { CircuitBreakerStatus } from "@msqd/lydia/Models/System";
import { useMemo, useState } from "react";
import { EndpointNode, type EndpointNodeProps } from "./EndpointNode";
import { EntrypointNode, type EntrypointNodeProps } from "./EntrypointNode";
import { NetworkEdges } from "./NetworkEdges";
import { ProxyNode, type ProxyNodeProps } from "./ProxyNode";

export type NetworkEntrypoint = EntrypointNodeProps["entrypoint"];
export type NetworkProxy = ProxyNodeProps["proxy"];
export type NetworkEndpoint = EndpointNodeProps["endpoint"];

export type NetworkConnection =
  | { from: string; to: string; type: "entrypoint-proxy" }
  | {
      from: string;
      to: string;
      type: "proxy-endpoint";
      circuitBreaker: { status: CircuitBreakerStatus; failureRate: number };
    };

/** Network topology: the nodes and connections rendered by the map. */
export interface NetworkTopology {
  entrypoints: NetworkEntrypoint[];
  proxies: NetworkProxy[];
  endpoints: NetworkEndpoint[];
  connections: NetworkConnection[];
}

export interface NetworkMapProps {
  /** The topology to render. */
  topology: NetworkTopology;
  className?: string;
}

// Calculate node positions for DAG layout
function calculateNodePositions(containerWidth: number, topology: NetworkTopology) {
  const padding = 30;
  const availableWidth = containerWidth - padding * 2;
  const columnWidth = availableWidth / 3; // Divide available width into 3 equal columns
  const nodeWidth = Math.min(220, columnWidth - 20); // Max 220px, but adapt to container
  const nodeHeight = 70;
  const nodeSpacing = 25;
  const headerHeight = 30;
  const startY = headerHeight + 20;

  // Position entrypoints in a vertical stack
  const entrypointPositions = topology.entrypoints.map((node, index) => ({
    id: node.id,
    x: padding,
    y: startY + index * (nodeHeight + nodeSpacing),
    width: nodeWidth,
    height: nodeHeight,
  }));

  // Position proxies (center them based on connected entrypoints)
  const proxyPositions = topology.proxies.map((proxy, index) => {
    const connectedEntrypoints = topology.connections
      .filter((conn) => conn.to === proxy.id && conn.type === "entrypoint-proxy")
      .map((conn) => entrypointPositions.find((ep) => ep.id === conn.from)!)
      .filter(Boolean);

    const avgY =
      connectedEntrypoints.length > 0
        ? connectedEntrypoints.reduce((sum, ep) => sum + ep.y + ep.height / 2, 0) / connectedEntrypoints.length -
          nodeHeight / 2
        : startY + index * (nodeHeight + nodeSpacing * 3);

    return {
      id: proxy.id,
      x: padding + columnWidth,
      y: Math.max(startY, avgY), // Ensure it doesn't go above header
      width: nodeWidth,
      height: nodeHeight,
    };
  });

  // Position endpoints (center them based on connected proxies)
  const endpointPositions = topology.endpoints.map((endpoint, index) => {
    const connectedProxies = topology.connections
      .filter((conn) => conn.to === endpoint.id && conn.type === "proxy-endpoint")
      .map((conn) => proxyPositions.find((p) => p.id === conn.from)!)
      .filter(Boolean);

    const avgY =
      connectedProxies.length > 0
        ? connectedProxies.reduce((sum, p) => sum + p.y + p.height / 2, 0) / connectedProxies.length - nodeHeight / 2
        : startY + index * (nodeHeight + nodeSpacing);

    return {
      id: endpoint.id,
      x: padding + columnWidth * 2,
      y: Math.max(startY, avgY), // Ensure it doesn't go above header
      width: nodeWidth,
      height: nodeHeight,
    };
  });

  return {
    entrypoints: entrypointPositions,
    proxies: proxyPositions,
    endpoints: endpointPositions,
  };
}

export function NetworkMap({ topology, className = "" }: NetworkMapProps) {
  const [connections, setConnections] = useState<NetworkConnection[]>(topology.connections);

  const containerWidth = 1200;
  const positions = useMemo(() => calculateNodePositions(containerWidth, topology), [topology]);

  const totalHeight = useMemo(
    () =>
      Math.max(
        ...positions.entrypoints.map((p) => p.y + p.height),
        ...positions.proxies.map((p) => p.y + p.height),
        ...positions.endpoints.map((p) => p.y + p.height),
      ) + 50,
    [positions],
  );

  const padding = 30;
  const columnWidth = (containerWidth - padding * 2) / 3;

  const handleCircuitBreakerChange = (from: string, to: string, newStatus: CircuitBreakerStatus) => {
    setConnections((prevConnections) =>
      prevConnections.map((conn) => {
        if (conn.from === from && conn.to === to && conn.type === "proxy-endpoint") {
          return { ...conn, circuitBreaker: { ...conn.circuitBreaker, status: newStatus } };
        }
        return conn;
      }),
    );
  };

  return (
    <Card className={`p-6 ${className} overflow-visible`}>
      <div
        className="relative w-full overflow-x-auto overflow-y-visible"
        style={{ minHeight: totalHeight, paddingBottom: "120px" }}
      >
        <div className="relative" style={{ minWidth: 800, width: "100%", minHeight: totalHeight }}>
          {/* Column headers */}
          <div className="absolute top-2 text-sm font-semibold text-gray-700" style={{ left: padding }}>
            Entrypoints
          </div>
          <div className="absolute top-2 text-sm font-semibold text-gray-700" style={{ left: padding + columnWidth }}>
            Proxies
          </div>
          <div
            className="absolute top-2 text-sm font-semibold text-gray-700"
            style={{ left: padding + columnWidth * 2 }}
          >
            Endpoints
          </div>

          {/* Entrypoint nodes */}
          {topology.entrypoints.map((entrypoint, index) => {
            const pos = positions.entrypoints[index];
            return (
              <div
                key={entrypoint.id}
                className="absolute"
                style={{ left: pos.x, top: pos.y, width: pos.width, height: pos.height }}
              >
                <EntrypointNode entrypoint={entrypoint} />
              </div>
            );
          })}

          {/* Proxy nodes */}
          {topology.proxies.map((proxy, index) => {
            const pos = positions.proxies[index];
            return (
              <div
                key={proxy.id}
                className="absolute"
                style={{ left: pos.x, top: pos.y, width: pos.width, height: pos.height }}
              >
                <ProxyNode proxy={proxy} />
              </div>
            );
          })}

          {/* Endpoint nodes */}
          {topology.endpoints.map((endpoint, index) => {
            const pos = positions.endpoints[index];
            return (
              <div
                key={endpoint.id}
                className="absolute"
                style={{ left: pos.x, top: pos.y, width: pos.width, height: pos.height }}
              >
                <EndpointNode endpoint={endpoint} />
              </div>
            );
          })}

          {/* Network edges */}
          <NetworkEdges
            connections={connections}
            positions={positions}
            onCircuitBreakerChange={handleCircuitBreakerChange}
          />
        </div>
      </div>
    </Card>
  );
}
