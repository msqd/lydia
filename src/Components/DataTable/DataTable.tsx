import { useRef } from "react";
import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface Column<TRow = unknown, TValue = unknown> {
  label: string;
  /** Method syntax on purpose: its parameter is then checked bivariantly, so `Column<TRow, number>` fits `Column<TRow, unknown>`. */
  format?(value: TValue): ReactNode;
  get?: (row: TRow) => TValue;
  onClick?: (row: TRow) => unknown;
  className?: string;
  headerClassName?: string;
  /**
   * Keep the label as the header's name but draw no text, for a column whose
   * cells explain themselves (a star, a checkbox). An empty header names
   * nothing for a screen reader.
   */
  labelHidden?: boolean;
  /**
   * Draw this column's cell as the row's header, `<th scope="row">`, so a
   * screen reader announces it with every other cell of the row. Give it to
   * the one column that names a row, the way a reader would: a path, a name.
   */
  rowHeader?: boolean;
}

// Helper type for columns that automatically infer correct TValue based on get function
export interface TypedColumn<TRow, TValue> extends Column<TRow, TValue> {
  get: (row: TRow) => TValue;
  format?(value: TValue): ReactNode;
}

// Helper type for simple columns that use row properties directly
export interface SimpleColumn<TRow, K extends keyof TRow> extends Column<TRow, TRow[K]> {
  get?: never;
  format?(value: TRow[K]): ReactNode;
}

/**
 * Columns for one row type, with `format` seeing exactly what `get` returned.
 *
 * `types` is keyed by string and typed `Column<TRow, unknown>`, because a table's
 * columns hold different kinds of value and one map has to carry them all.
 * Written directly, that `any` reaches `format`: a column reading a number and
 * formatting it as a string type-checks, and the mistake arrives as
 * `undefined is not a function` in a browser. `TypedColumn` says the right
 * thing and nothing was in a position to apply it, since inference cannot run
 * through the map's own annotation.
 *
 * Call this once per row type and build each column through what it returns:
 *
 * ```tsx
 * const column = columnsFor<Transaction>();
 *
 * const types: Record<string, Column<Transaction, unknown>> = {
 *   status: column({
 *     label: "Status",
 *     get: (row) => row.statusCode,          // row is Transaction
 *     format: (status) => <StatusBadge code={status} />,  // status is number
 *   }),
 * };
 * ```
 *
 * The row type is fixed once so it is not repeated on every `get`, and the
 * value type is inferred per column. It is the shape TanStack Table settled on
 * with `createColumnHelper<Row>()`, and for the same reason: TypeScript can
 * infer a value type from a function it is given, and cannot infer one from
 * the type of the map that function's result lands in.
 *
 * **Nothing that already passes a `types` map has to change.** The prop's type
 * is untouched, and what this returns is an ordinary `Column`.
 *
 * This is for a column that computes its value. One that reads a row property
 * straight has no `get` for a value type to be inferred from, and is already
 * served by `SimpleColumn<TRow, K>`.
 */
export function columnsFor<TRow>() {
  return <TValue,>(column: TypedColumn<TRow, TValue>): TypedColumn<TRow, TValue> => column;
}

export type BaseRow = Record<string, unknown>;

/**
 * `children` is the one table attribute a caller cannot pass: the rows and the
 * header are built from `rows`, `types` and `columns`, so anything handed in
 * here could only be dropped or fight them. `role` is accepted by the type and
 * then overruled — see the comment on the element itself.
 */
interface DataTableProps<TRow extends object, TComputed extends object = BaseRow>
  extends Omit<ComponentProps<"table">, "children"> {
  rows: TRow[];
  types: Record<string, Column<TRow, unknown>>;
  columns?: Array<keyof (TRow & TComputed)>;
  onRowClick?: (row: TRow) => unknown;
  selected?: TRow;
  rowKey?: keyof TRow;
}

const tableClasses = "min-w-full divide-y divide-gray-300 text-left";
const thClasses = "whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900";
const tdClasses = "whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900";

function formatRowValue<TRow extends object, TComputed extends object>(
  type: Column<TRow, unknown>,
  row: TRow,
  name: keyof (TRow & TComputed),
): ReactNode {
  try {
    let value: unknown;
    if (type.get) {
      value = type.get(row);
    } else {
      // Use string key to access row property
      value = (row as Record<string, unknown>)[String(name)];
    }

    if (type.format) {
      return type.format(value);
    }

    if (!value) {
      return "-";
    }

    return value as ReactNode;
  } catch (e) {
    console.error(`Error while rendering value of ${String(name)}:\n`, e);
    /* todo warning sign with error in hover ? */
    return "n/a";
  }
}

export function DataTable<TRow extends object, TComputed extends object = BaseRow>({
  columns,
  onRowClick,
  rows,
  types,
  selected = undefined,
  rowKey = "id" as keyof TRow, // rows without an `id` must pass `rowKey`
  className,
  ...table
}: DataTableProps<TRow, TComputed>) {
  const body = useRef<HTMLTableSectionElement>(null);

  const isSelected = (row: TRow) =>
    selected !== undefined &&
    row[rowKey] !== undefined &&
    selected[rowKey] !== undefined &&
    selected[rowKey] === row[rowKey];

  /**
   * One tab stop for the whole table, on the chosen row when there is one.
   *
   * A row per tab stop would put a hundred of them between the table and
   * whatever follows it, and returning to the table would start again from the
   * top rather than from the row being read.
   */
  const selectedIndex = rows.findIndex(isSelected);
  const tabStop = selectedIndex === -1 ? 0 : selectedIndex;

  /** Deliberately clamped rather than wrapped: an end a reader cannot see is
   * still an end, and silently reappearing at the other one hides it. */
  const focusRow = (index: number) => {
    const elements = body.current?.rows;
    if (!elements?.length) return;
    elements[Math.max(0, Math.min(index, elements.length - 1))].focus();
  };

  const onRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: TRow, index: number) => {
    if (!onRowClick) return;

    switch (event.key) {
      case "Enter":
      case " ":
        // Space scrolls the page unless it is claimed here.
        event.preventDefault();
        onRowClick(row);
        break;
      case "ArrowDown":
        event.preventDefault();
        focusRow(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusRow(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusRow(0);
        break;
      case "End":
        event.preventDefault();
        focusRow(rows.length - 1);
        break;
    }
  };

  return (
    /*
      The caller's attributes first, then the two this component owns.

      `className` is merged rather than replaced, so a caller adding a margin
      does not silently drop the table's own layout.

      `role` is last, which makes it the component's rather than the caller's.
      A grid only once its rows can be chosen: `aria-selected` on a row means
      nothing on a plain table, and announcing an interactive grid for a table
      nobody can operate is a promise it does not keep. Both halves come from
      the same answer, so a caller setting `role="table"` on a selectable table
      would leave `aria-selected` on rows that are not in a grid. That is the
      lie this component stopped telling, and it is not worth reintroducing
      through a prop.
    */
    <table {...table} className={twMerge(tableClasses, className)} role={onRowClick ? "grid" : undefined}>
      <thead>
        <tr>
          {columns?.map((name) => {
            const colName = String(name);
            const colType = types[colName];
            return (
              <th scope="col" key={colName} className={`${thClasses} ${colType.headerClassName ?? ""}`}>
                {colType.labelHidden ? (
                  <span className="sr-only">{colType.label ?? name}</span>
                ) : (
                  (colType.label ?? name)
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody ref={body} className="divide-y divide-gray-200 bg-white">
        {rows.map((row, index) => {
          return (
            <tr
              key={row[rowKey] === undefined ? index : String(row[rowKey])}
              onClick={
                onRowClick
                  ? (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRowClick(row);
                    }
                  : undefined
              }
              tabIndex={onRowClick ? (index === tabStop ? 0 : -1) : undefined}
              aria-selected={onRowClick ? isSelected(row) : undefined}
              onKeyDown={onRowClick ? (event) => onRowKeyDown(event, row, index) : undefined}
              className={[
                "hover:bg-slate-50",
                // A pointer over a row nothing happens on was a lie the table
                // told before it could be operated at all. And a tab stop with
                // no visible focus is one nobody can follow -- WCAG 2.4.7.
                onRowClick
                  ? "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-600"
                  : "",
                isSelected(row) ? "bg-slate-100" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {columns?.map((name, index) => {
                const colName = String(name);
                const colType = types[colName];
                const colProps: { onClick?: () => unknown } = {};
                if (colType.onClick !== undefined) {
                  const onClick = colType.onClick;
                  colProps.onClick = () => onClick(row);
                }
                const Cell = colType.rowHeader ? "th" : "td";
                return (
                  <Cell
                    key={index}
                    scope={colType.rowHeader ? "row" : undefined}
                    className={`${tdClasses} ${colType.className ?? ""}`}
                    {...colProps}
                  >
                    {formatRowValue<TRow, TComputed>(colType, row, name)}
                  </Cell>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
