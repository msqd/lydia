import { Badge, type BadgeColor } from "@msqd/lydia/Components/Badges/Badge";
import type { FC } from "react";

const methodColors: Record<string, BadgeColor> = {
  GET: "green",
  DELETE: "red",
  PUT: "yellow",
  POST: "orange",
  PATCH: "purple",
  OPTIONS: "blue",
};

export interface RequestMethodBadgeProps {
  method: string;
}

export const RequestMethodBadge: FC<RequestMethodBadgeProps> = ({ method }) => (
  <Badge data-testid={`method-badge-${method}`} color={methodColors[method]}>
    {method}
  </Badge>
);
