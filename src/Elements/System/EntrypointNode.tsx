import { Badge } from "@msqd/lydia/Components/Badges";
import { NetworkNode, NetworkNodeDetail } from "./NetworkNode";

export interface EntrypointNodeProps {
  entrypoint: {
    id: string;
    name: string;
    port: number;
    path: string;
  };
}

export function EntrypointNode({ entrypoint }: EntrypointNodeProps) {
  return (
    <NetworkNode
      tone="blue"
      title={entrypoint.name}
      action={
        <Badge color="blue" className="text-xs px-1 py-0">
          {entrypoint.port}
        </Badge>
      }
    >
      <NetworkNodeDetail>{entrypoint.path}</NetworkNodeDetail>
    </NetworkNode>
  );
}
