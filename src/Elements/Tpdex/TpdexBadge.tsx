import { calculateTpdexScore, getTpdexRating, getTpdexTextClassName } from "@msqd/lydia/Models/Tpdex";
import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface TpdexBadgeProps extends Omit<ComponentProps<"span">, "children"> {
  /**
   * Response time in milliseconds, used to estimate a score when none was measured
   */
  responseTime?: number;
  /**
   * Measured TPDEX score (0-100). Pass this only when the score was measured: supplying it is what
   * tells the badge it is showing a measurement rather than an estimate.
   */
  score?: number;
  /**
   * Whether to show the numeric score alongside the rating label
   */
  showScore?: boolean;
}

/**
 * Badge displaying a TPDEX performance rating.
 *
 * A transaction that has not ended carries no score, so the badge estimates one from the response
 * time and **says that it did**: an estimate is marked with a leading tilde and a dashed outline.
 * The two claims must not look alike, because filtering treats an unscored transaction as matching
 * no bounded range, so a user who reads an `A` and filters for 90 and above would otherwise watch
 * the row vanish with nothing on screen explaining it.
 */
export function TpdexBadge({ responseTime, score, showScore = false, className, ...props }: TpdexBadgeProps) {
  const isEstimated = score === undefined;
  const tpdexScore = isEstimated ? calculateTpdexScore(responseTime || 0) : score;
  const rating = getTpdexRating(tpdexScore);
  const reading = `${rating.label}, ${tpdexScore} out of 100`;

  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded font-medium px-2 py-0.5 text-xs",
        rating.className,
        getTpdexTextClassName(rating),
        // Outline rather than border, so an estimate occupies exactly the same space as a
        // measurement and a column of badges does not jog sideways.
        isEstimated && "outline-dashed outline-1 -outline-offset-2 outline-white/70",
        className,
      )}
      role="img"
      aria-label={isEstimated ? `Estimated TPDEX ${reading}, from response time` : `TPDEX ${reading}`}
      title={
        isEstimated
          ? `TPDEX ${rating.label} (${tpdexScore}/100), estimated from response time: this transaction has no measured score yet`
          : `TPDEX Score: ${tpdexScore}/100 (${rating.label})`
      }
      {...props}
    >
      {isEstimated ? `~${rating.label}` : rating.label}
      {showScore && <span className="ml-1 opacity-90">({tpdexScore})</span>}
    </span>
  );
}
