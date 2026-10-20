import { H2, HeadingLevel, P, Section } from "@msqd/lydia/Components/Typography";
import { NetworkMap, type NetworkTopology } from "@msqd/lydia/Elements/System";
import type { ComponentProps } from "react";

export interface SystemPageProps extends ComponentProps<"div"> {
  /** Network topology to render in the architecture map. */
  topology: NetworkTopology;
  className?: string;
}

export function SystemPage({ topology, className = "", ...props }: SystemPageProps) {
  return (
    <div className={`space-y-6 ${className}`} {...props}>
      <Section>
        <H2>System Architecture</H2>
        <P className="text-gray-600 mb-6">
          Network topology showing traffic flow from ingresses through proxies to endpoints.
        </P>
        <HeadingLevel level={2}>
          <NetworkMap topology={topology} />
        </HeadingLevel>
      </Section>
    </div>
  );
}
