import { type TpdexRating, getTpdexTextClassName } from "./Tpdex";

/**
 * What `TpdexRating` promises consumers, checked by the compiler (`pnpm types`).
 *
 * Consumers build their own ratings, and `textClassName` arrived after them: it
 * stays optional so a rating written without it still type-checks.
 */
const writtenWithoutTextClassName: TpdexRating = {
  label: "A",
  threshold: 93,
  className: "bg-tpdex-a",
  token: "--color-tpdex-a",
};

getTpdexTextClassName(writtenWithoutTextClassName) satisfies string;
