import type { CircuitBreakerStatus as CircuitBreakerStatusType } from "@msqd/lydia/Models/System";
import { CircuitBreakerStatus } from "./CircuitBreakerStatus";

export interface NetworkEdgesProps {
  connections: Array<{
    from: string;
    to: string;
    type: "entrypoint-proxy" | "proxy-endpoint";
    circuitBreaker?: {
      status: CircuitBreakerStatusType;
      failureRate: number;
    };
  }>;
  positions: {
    entrypoints: Array<{ id: string; x: number; y: number; width: number; height: number }>;
    proxies: Array<{ id: string; x: number; y: number; width: number; height: number }>;
    endpoints: Array<{ id: string; x: number; y: number; width: number; height: number }>;
  };
  onCircuitBreakerChange?: (from: string, to: string, status: CircuitBreakerStatusType) => void;
}

export function NetworkEdges({ connections, positions, onCircuitBreakerChange }: NetworkEdgesProps) {
  const allNodes = [...positions.entrypoints, ...positions.proxies, ...positions.endpoints];

  const getNodePosition = (id: string) => {
    return allNodes.find((node) => node.id === id);
  };

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, overflow: "visible" }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 12 4, 0 8" fill="#6366f1" />
        </marker>
      </defs>

      {connections.map((connection) => {
        const fromNode = getNodePosition(connection.from);
        const toNode = getNodePosition(connection.to);

        if (!fromNode || !toNode) {
          console.warn(`Missing node for connection: ${connection.from} -> ${connection.to}`);
          return null;
        }

        // Calculate connection points at the edges of nodes
        const fromX = fromNode.x + fromNode.width; // Right edge of from node
        const fromY = fromNode.y + fromNode.height / 2; // Vertical center of from node
        const toX = toNode.x; // Left edge of to node
        const toY = toNode.y + toNode.height / 2; // Vertical center of to node

        // Calculate control points for the bezier curve
        const controlPointOffset = Math.abs(toX - fromX) * 0.5;
        const controlX1 = fromX + controlPointOffset;
        const controlX2 = toX - controlPointOffset;

        const pathData = `M ${fromX} ${fromY} C ${controlX1} ${fromY}, ${controlX2} ${toY}, ${toX} ${toY}`;

        return (
          <g key={`${connection.from}-${connection.to}`}>
            {/* Connection line */}
            <path d={pathData} stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" opacity="0.8" />

            {/* Circuit breaker indicator for proxy-endpoint connections */}
            {connection.circuitBreaker && (
              <foreignObject
                x={(fromX + toX) / 2 - 50}
                y={(fromY + toY) / 2 - 12}
                width="100"
                height="24"
                className="pointer-events-auto"
                style={{ overflow: "visible" }}
              >
                <CircuitBreakerStatus
                  circuitBreaker={connection.circuitBreaker}
                  compact
                  editable
                  onChange={(status) => onCircuitBreakerChange?.(connection.from, connection.to, status)}
                />
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
}
