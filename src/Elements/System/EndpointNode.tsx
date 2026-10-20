import { Badge } from "@msqd/lydia/Components/Badges";
import { type HealthStatus, healthStatusMap } from "@msqd/lydia/Models/System";
import { NetworkNode, NetworkNodeDetail } from "./NetworkNode";

export interface EndpointNodeProps {
  endpoint: {
    id: string;
    name: string;
    url: string;
    health: HealthStatus;
  };
}

export function EndpointNode({ endpoint }: EndpointNodeProps) {
  const healthConfig = healthStatusMap[endpoint.health];

  return (
    <NetworkNode
      tone="green"
      title={endpoint.name}
      action={
        <Badge color={healthConfig.color} className="text-xs px-1 py-0">
          {endpoint.health}
        </Badge>
      }
    >
      <NetworkNodeDetail>{endpoint.url}</NetworkNodeDetail>
    </NetworkNode>
  );
}
