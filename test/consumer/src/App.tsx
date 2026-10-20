import type { BadgeColor } from "@msqd/lydia";
import { Badge } from "@msqd/lydia/Components/Badges";

// Fails to compile if the declarations resolve to `any` instead of lydia's real types.
// @ts-expect-error "not-a-color" is not a BadgeColor
const invalid: BadgeColor = "not-a-color";

export function App() {
  return (
    <Badge color="success" data-invalid={invalid}>
      Healthy
    </Badge>
  );
}
