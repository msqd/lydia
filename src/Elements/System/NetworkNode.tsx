import { Subheading } from "@msqd/lydia/Components/Typography/HeadingLevel";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

/** Tones a node can take. Written out rather than composed, because Tailwind scans for whole class names. */
const toneClassName = {
  blue: "bg-blue-50 border-blue-200",
  green: "bg-green-50 border-green-200",
  purple: "bg-purple-50 border-purple-200",
} as const;

export interface NetworkNodeProps extends ComponentProps<"div"> {
  /** Which kind of node this is. Carries the tone only; the map's legend carries the meaning. */
  tone: keyof typeof toneClassName;
  /** Name of the node, truncated rather than wrapped, since a node has a fixed height */
  title: string;
  /** Optional element on the title row, such as a health or port badge */
  action?: ReactNode;
  /** Body of the node, under the title row */
  children?: ReactNode;
}

/**
 * Shell every node in the network map is drawn in.
 *
 * The three node kinds differ in what they show, not in how they are framed, and the frame is one
 * design decision: box, border, radius, height and title row. It lived in three copies that had to
 * be changed together and nothing said so.
 */
export function NetworkNode({ tone, title, action, children, className, ...props }: NetworkNodeProps) {
  return (
    <div
      className={twMerge("border rounded-lg p-3 h-full flex flex-col justify-center", toneClassName[tone], className)}
      {...props}
    >
      <div className="flex items-center justify-between mb-1">
        <Subheading className="font-semibold text-gray-900 text-sm truncate">{title}</Subheading>
        {action}
      </div>
      {children}
    </div>
  );
}

/** A node's secondary line: a URL or a path, monospaced and truncated. */
export type NetworkNodeDetailProps = ComponentProps<"div">;

export function NetworkNodeDetail({ className, children, ...props }: NetworkNodeDetailProps) {
  return (
    <div className={twMerge("text-xs text-gray-600 font-mono truncate", className)} {...props}>
      {children}
    </div>
  );
}
