import { Badge } from "@msqd/lydia/Components/Badges";
import { NetworkNode } from "./NetworkNode";

export interface ProxyNodeProps {
  proxy: {
    id: string;
    name: string;
    implementation: string;
  };
}

export function ProxyNode({ proxy }: ProxyNodeProps) {
  const implColor = proxy.implementation === "harp" ? "purple" : "green";

  return (
    <NetworkNode tone="purple" title={proxy.name}>
      <div className="flex justify-start">
        <Badge color={implColor} className="text-xs">
          {proxy.implementation.toUpperCase()}
        </Badge>
      </div>
    </NetworkNode>
  );
}
