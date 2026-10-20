import { Badge, type BadgeColor } from "@msqd/lydia/Components/Badges/Badge";
import { getReasonPhrase } from "http-status-codes";
import type { FC } from "react";

const _getStatusColorFromStatusCode = (statusCode: number): BadgeColor => {
  if (statusCode >= 200 && statusCode < 300) return "success";
  if (statusCode >= 300 && statusCode < 400) return "blue";
  if (statusCode >= 400 && statusCode < 500) return "warning";
  if (statusCode >= 500 && statusCode < 600) return "danger";
  if (statusCode >= 600) return "purple";
  return "default";
};

const _getReasonPhrase = (statusCode: number): string => {
  try {
    return getReasonPhrase(statusCode);
  } catch {
    return "Unknown";
  }
};

export interface ResponseStatusBadgeProps {
  statusCode: number;
  /**
   * Whether to spell the reason phrase out beside the code.
   *
   * On by default, so nothing that renders this today changes. Turn it off
   * where the badge appears once per row of a list: the colour already says
   * the class and the number already says the code, so "Internal Server Error"
   * spelled out on every row of a kind is the same words repeated down the
   * page, and it costs the width a consumer would rather give to whatever
   * identifies the row.
   *
   * Keep it on where there is one of them — a detail panel — since that is
   * where a reader may genuinely not know what 422 means.
   */
  showReason?: boolean;
}

export const ResponseStatusBadge: FC<ResponseStatusBadgeProps> = ({ statusCode, showReason = true }) => {
  const color = _getStatusColorFromStatusCode(statusCode);

  return (
    <Badge data-testid={`status-badge-${statusCode}`} color={color}>
      {/* The two branches rather than one string with an optional tail: this
          keeps the default's markup byte-for-byte what it was, so no existing
          snapshot moves and the diff is only the new option. The phrase is
          also looked up only when it will be rendered -- the lookup throws on
          a code the table does not know, and catching that to discard the
          answer is work done to reach the same badge. */}
      {showReason ? (
        <>
          {statusCode} {_getReasonPhrase(statusCode)}
        </>
      ) : (
        statusCode
      )}
    </Badge>
  );
};
