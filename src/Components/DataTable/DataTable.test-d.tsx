import { type Column, columnsFor } from "./DataTable";

/**
 * What `Column<TRow, TValue>` promises, checked by the compiler.
 *
 * These are type assertions and not tests that run: every `@ts-expect-error`
 * below is an error the compiler must raise, and an unused one is itself an
 * error. So this file fails in both directions -- a promise that stops holding
 * shows up as a missing error, and one that was never true shows up as an
 * unused directive.
 *
 * Checked by `pnpm types`, which is what CI runs.
 */

interface Row {
  id: string;
  statusCode: number;
  url: string;
}

const column = columnsFor<Row>();

/**
 * The defect this file was opened for.
 *
 * A table's columns hold different kinds of value, so the map that carries
 * them is keyed by string and typed `Column<TRow, any>`. Written directly,
 * that `any` reaches `format` -- so a column reading a number and formatting
 * it as a string type-checked, and the mistake surfaced as `undefined is not
 * a function` in a browser. The map is now `Column<TRow, unknown>`, which
 * typed columns still fit because `format` is declared as a method.
 */
column({
  label: "Status",
  get: (row) => row.statusCode,
  // @ts-expect-error `format` sees the number `get` returned, not `any`
  format: (status) => status.toUpperCase(),
});

column({
  label: "URL",
  get: (row) => row.url,
  // The same column with the value it actually has: no error, so the check
  // above is about `format`'s type and not about `toUpperCase` being rejected
  // everywhere.
  format: (url) => url.toUpperCase(),
});

/** `get` sees the row, so a field the row does not have is caught. */
column({
  label: "Nope",
  // @ts-expect-error `nothing` is not on Row
  get: (row) => row.nothing.toFixed(),
});

/**
 * The whole row is a value like any other, which is how a column marking the
 * leading edge of a row is written.
 */
column({
  label: "Row",
  get: (row) => row,
  format: (row) => row.url,
});

/**
 * A map built this way still fits the prop, which is the point of the helper
 * rather than of a new map type.
 */
const types: Record<string, Column<Row, unknown>> = {
  status: column({ label: "Status", get: (row) => row.statusCode }),
  url: column({ label: "URL", get: (row) => row.url }),
};

export { types };
