import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, columnsFor } from "./DataTable";
import type { Column, TypedColumn } from "./DataTable";

describe("DataTable", () => {
  // Test data setup
  const types: Record<string, Column> = {
    firstName: { label: "First name" },
    lastName: { label: "Last name" },
    instrument: { label: "Instrument" },
    country: { label: "Country" },
  };

  const columns = ["firstName", "lastName", "instrument", "country"];
  const rows = [
    {
      firstName: "John",
      lastName: "Coltrane",
      instrument: "Saxophone",
      country: "USA",
      id: 1,
    },
    {
      firstName: "Miles",
      lastName: "Davis",
      instrument: "Trumpet",
      country: "USA",
      id: 2,
    },
    {
      firstName: "Thelonious",
      lastName: "Monk",
      instrument: "Piano",
      country: "USA",
      id: 3,
    },
    {
      firstName: "Charles",
      lastName: "Mingus",
      instrument: "Double Bass",
      country: "USA",
      id: 4,
    },
  ];

  // Basic rendering tests
  it("renders correctly", () => {
    const { container } = render(<DataTable types={types} columns={columns} rows={rows} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the table headers", () => {
    const { getByText } = render(<DataTable types={types} columns={columns} rows={rows} />);

    expect(getByText("First name")).toBeInTheDocument();
    expect(getByText("Last name")).toBeInTheDocument();
    expect(getByText("Instrument")).toBeInTheDocument();
    expect(getByText("Country")).toBeInTheDocument();
  });

  it("renders the table rows", () => {
    const { getByText, getAllByText } = render(<DataTable types={types} columns={columns} rows={rows} />);

    expect(getByText("John")).toBeInTheDocument();
    expect(getByText("Coltrane")).toBeInTheDocument();
    expect(getByText("Saxophone")).toBeInTheDocument();
    expect(getByText("Miles")).toBeInTheDocument();
    expect(getByText("Davis")).toBeInTheDocument();
    expect(getByText("Trumpet")).toBeInTheDocument();
    expect(getAllByText("USA").length).toBe(4);
  });

  // Interactive functionality tests
  it("calls onRowClick when a row is clicked", () => {
    const onRowClick = vi.fn();
    const { getByText } = render(<DataTable types={types} columns={columns} rows={rows} onRowClick={onRowClick} />);

    fireEvent.click(getByText("John"));
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  // Column configuration tests
  it("uses provided get function to retrieve data", () => {
    const getfn = vi.fn((row: (typeof rows)[0]) => row.firstName);

    const customTypes = {
      firstName: { label: "First name", get: getfn } satisfies TypedColumn<(typeof rows)[0], string>,
      lastName: { label: "Last name" },
      instrument: { label: "Instrument" },
      country: { label: "Country" },
    };

    render(<DataTable types={customTypes} columns={columns} rows={rows} />);

    rows.forEach((row) => {
      expect(getfn).toHaveBeenCalledWith(row);
    });
  });

  it("uses provided format function to display data", () => {
    const formatfn = vi.fn((firstName: string) => firstName);

    const customTypes = {
      firstName: { label: "First name", format: formatfn },
      lastName: { label: "Last name" },
      instrument: { label: "Instrument" },
      country: { label: "Country" },
    };

    render(<DataTable types={customTypes} columns={columns} rows={rows} />);

    rows.forEach((row) => {
      expect(formatfn).toHaveBeenCalledWith(row.firstName);
    });
  });

  // Edge case handling tests
  it("shows '-' when a cell has no value", () => {
    const incompleteRows = [{ firstName: "Charles", lastName: "Mingus", instrument: "Double Bass" }];

    const { getByText } = render(<DataTable types={types} columns={columns} rows={incompleteRows} />);

    expect(getByText("-")).toBeInTheDocument();
  });

  it("allows specific onClick actions for individual columns", () => {
    const onClick = vi.fn();
    const clickableTypes = {
      firstName: { label: "First name", onClick },
      lastName: { label: "Last name" },
      instrument: { label: "Instrument" },
      country: { label: "Country" },
    };

    const { getByText } = render(<DataTable types={clickableTypes} columns={columns} rows={rows} />);

    fireEvent.click(getByText("John"));
    expect(onClick).toHaveBeenCalledWith(rows[0]);
  });

  // Error handling tests
  it("handles errors in get or format function and shows 'n/a'", () => {
    const getfn = vi.fn(() => {
      throw new Error("test error");
    });

    const errorTypes = {
      firstName: { label: "First name", get: getfn },
      lastName: { label: "Last name" },
      instrument: { label: "Instrument" },
      country: { label: "Country" },
    };

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { getAllByText } = render(<DataTable types={errorTypes} columns={columns} rows={rows} />);

    expect(getAllByText("n/a").length).toBe(4);
    consoleErrorSpy.mockRestore();
  });

  // New test for row selection
  it("applies correct selection styling only to the selected row", () => {
    // Select the second row (Miles Davis)
    const { container } = render(
      <DataTable types={types} columns={columns} rows={rows} selected={rows[1]} rowKey="id" />,
    );

    const tableRows = container.querySelectorAll("tbody tr");
    expect(tableRows.length).toBe(4);

    // Check that only the second row has the bg-slate-100 class
    expect(tableRows[1].className).toContain("bg-slate-100");

    // Check that other rows don't have the selection class
    expect(tableRows[0].className).not.toContain("bg-slate-100");
    expect(tableRows[2].className).not.toContain("bg-slate-100");
    expect(tableRows[3].className).not.toContain("bg-slate-100");
  });

  // Edge case and robustness tests
  it("handles selection correctly even when rowKey value is missing in some rows", () => {
    // Rows with missing id values
    const rowsWithMissingIds = [
      {
        firstName: "John",
        lastName: "Coltrane",
        instrument: "Saxophone",
        country: "USA",
      },
      {
        firstName: "Miles",
        lastName: "Davis",
        instrument: "Trumpet",
        country: "USA",
        id: 2,
      },
      {
        firstName: "Thelonious",
        lastName: "Monk",
        instrument: "Piano",
        country: "USA",
      },
      {
        firstName: "Charles",
        lastName: "Mingus",
        instrument: "Double Bass",
        country: "USA",
        id: 4,
      },
    ];

    // Selected row should have the id property
    const { container } = render(
      <DataTable
        types={types}
        columns={columns}
        rows={rowsWithMissingIds}
        selected={rowsWithMissingIds[1]}
        rowKey="id"
      />,
    );

    const tableRows = container.querySelectorAll("tbody tr");

    // Only the second row (with id=2) should be selected
    expect(tableRows[1].className).toContain("bg-slate-100");
    expect(tableRows[0].className).not.toContain("bg-slate-100");
    expect(tableRows[2].className).not.toContain("bg-slate-100");
    expect(tableRows[3].className).not.toContain("bg-slate-100");
  });

  /**
   * The table underneath is a `<table>`, and a caller should be able to say so.
   *
   * Nothing could be passed to it: no `aria-label`, no `id`, no `className`.
   * A grid with no accessible name is announced as an unlabelled "grid" to
   * anyone listing the tables on a page, and a product with two of them cannot
   * tell them apart. It is not a violation a tool will report — no axe rule
   * requires a grid to be named — which is why it survived: a clean
   * accessibility run stays clean either way.
   */
  describe("the table's own attributes", () => {
    it("can be given an accessible name", () => {
      render(<DataTable types={types} columns={columns} rows={rows} aria-label="Musicians" />);

      expect(screen.getByRole("table", { name: "Musicians" })).toBeInTheDocument();
    });

    it("names the grid too, which is the case the name is most needed in", () => {
      render(<DataTable types={types} columns={columns} rows={rows} onRowClick={vi.fn()} aria-label="Musicians" />);

      expect(screen.getByRole("grid", { name: "Musicians" })).toBeInTheDocument();
    });

    it("passes an ordinary table attribute through", () => {
      render(<DataTable types={types} columns={columns} rows={rows} id="musicians" />);

      expect(screen.getByRole("table")).toHaveAttribute("id", "musicians");
    });

    it("adds a caller's classes to its own rather than replacing them", () => {
      render(<DataTable types={types} columns={columns} rows={rows} className="mt-4" />);

      const table = screen.getByRole("table");
      expect(table).toHaveClass("mt-4");
      expect(table).toHaveClass("min-w-full");
    });

    /**
     * The role is the component's, and deliberately not a caller's to set.
     *
     * It is derived from whether rows can be chosen, and `aria-selected` on
     * the rows is derived from the same answer. A caller who set `role="table"`
     * on a table whose rows are selectable would produce `aria-selected` on
     * rows that are not in a grid, which is invalid — and the inverse announces
     * a grid nobody can operate. Both are the lie this component stopped
     * telling.
     */
    it("does not let a caller contradict the role it derived", () => {
      render(<DataTable types={types} columns={columns} rows={rows} onRowClick={vi.fn()} role="table" />);

      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
  });

  /**
   * A row that answers the mouse and nothing else.
   *
   * `onRowClick` made rows clickable and left them unreachable: no tabIndex, no
   * key handler, no role saying they could be chosen. Any product whose central
   * gesture is picking a row was unusable without a mouse — a WCAG 2.1.1 level A
   * failure, which is the floor rather than the aspiration.
   *
   * The pattern is the one the ARIA authoring practices describe for a grid
   * navigated by row: one tab stop for the whole table, arrows to move within
   * it, Enter or Space to choose. A hundred rows must not be a hundred tab
   * stops.
   */
  describe("row identity", () => {
    function Star() {
      const [on, setOn] = useState(false);
      return (
        <button type="button" aria-pressed={on} onClick={() => setOn(!on)}>
          star
        </button>
      );
    }
    const starred: Record<string, Column> = {
      name: { label: "Name" },
      star: { label: "Star", get: () => null, format: () => <Star /> },
    };
    const page = (...names: string[]) => names.map((name) => ({ id: name, name }));

    it("moves a stateful cell with its row when the rows change", () => {
      const { rerender } = render(<DataTable types={starred} columns={["name", "star"]} rows={page("a", "b")} />);
      fireEvent.click(screen.getAllByRole("button")[0]);

      rerender(<DataTable types={starred} columns={["name", "star"]} rows={page("c", "a")} />);

      const [first, second] = screen.getAllByRole("button");
      expect(first).toHaveAttribute("aria-pressed", "false");
      expect(second).toHaveAttribute("aria-pressed", "true");
    });

    it("keys by the given rowKey", () => {
      const keyed = (...slugs: string[]) => slugs.map((slug) => ({ slug, name: slug }));
      const { rerender } = render(
        <DataTable types={starred} columns={["name", "star"]} rows={keyed("a", "b")} rowKey="slug" />,
      );
      fireEvent.click(screen.getAllByRole("button")[0]);

      rerender(<DataTable types={starred} columns={["name", "star"]} rows={keyed("b", "a")} rowKey="slug" />);

      expect(screen.getAllByRole("button")[1]).toHaveAttribute("aria-pressed", "true");
    });

    it("falls back to the position for rows without the key", () => {
      const anonymous = (...names: string[]) => names.map((name) => ({ name }));
      const { rerender } = render(<DataTable types={starred} columns={["name", "star"]} rows={anonymous("a", "b")} />);
      fireEvent.click(screen.getAllByRole("button")[0]);

      rerender(<DataTable types={starred} columns={["name", "star"]} rows={anonymous("c", "d")} />);

      expect(screen.getAllByRole("button")[0]).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("keyboard", () => {
    const body = () => within(screen.getAllByRole("rowgroup")[1]);
    const bodyRows = () => body().getAllByRole("row");

    it("leaves a table nobody can click as a plain table", () => {
      // Without `onRowClick` there is nothing to operate, and announcing an
      // interactive grid to a screen reader would be a promise the table does
      // not keep.
      render(<DataTable types={types} columns={columns} rows={rows} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
      for (const row of bodyRows()) {
        expect(row).not.toHaveAttribute("tabindex");
        expect(row).not.toHaveAttribute("aria-selected");
      }
    });

    it("is a grid once its rows can be chosen", () => {
      // `aria-selected` on a row is only meaningful inside a grid; on a plain
      // table it is not allowed at all.
      render(<DataTable types={types} columns={columns} rows={rows} onRowClick={vi.fn()} />);

      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("takes one tab stop, not one per row", () => {
      render(<DataTable types={types} columns={columns} rows={rows} onRowClick={vi.fn()} />);

      const focusable = bodyRows().filter((row) => row.getAttribute("tabindex") === "0");
      expect(focusable).toHaveLength(1);
      expect(focusable[0]).toBe(bodyRows()[0]);
    });

    it("puts that tab stop on the chosen row, so returning lands where you left", () => {
      render(
        <DataTable types={types} columns={columns} rows={rows} selected={rows[2]} rowKey="id" onRowClick={vi.fn()} />,
      );

      expect(bodyRows()[2]).toHaveAttribute("tabindex", "0");
      expect(bodyRows()[0]).toHaveAttribute("tabindex", "-1");
    });

    it("reaches the rows with the Tab key", async () => {
      render(<DataTable types={types} columns={columns} rows={rows} onRowClick={vi.fn()} />);

      await userEvent.tab();

      expect(bodyRows()[0]).toHaveFocus();
    });

    it("chooses a row with Enter", async () => {
      const onRowClick = vi.fn();
      render(<DataTable types={types} columns={columns} rows={rows} onRowClick={onRowClick} />);

      await userEvent.tab();
      await userEvent.keyboard("{Enter}");

      expect(onRowClick).toHaveBeenCalledWith(rows[0]);
    });

    it("chooses a row with Space", async () => {
      const onRowClick = vi.fn();
      render(<DataTable types={types} columns={columns} rows={rows} onRowClick={onRowClick} />);

      await userEvent.tab();
      await userEvent.keyboard("{ }");

      expect(onRowClick).toHaveBeenCalledWith(rows[0]);
    });

    it("moves between rows with the arrows, and stops at the ends", async () => {
      render(<DataTable types={types} columns={columns} rows={rows} onRowClick={vi.fn()} />);

      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}");
      expect(bodyRows()[1]).toHaveFocus();

      await userEvent.keyboard("{ArrowUp}");
      expect(bodyRows()[0]).toHaveFocus();

      // Not a wrap: at the first row, up is where you already are. Wrapping
      // hides the edge of the list from someone who cannot see it.
      await userEvent.keyboard("{ArrowUp}");
      expect(bodyRows()[0]).toHaveFocus();
    });

    it("jumps to the first and last rows with Home and End", async () => {
      render(<DataTable types={types} columns={columns} rows={rows} onRowClick={vi.fn()} />);

      await userEvent.tab();
      await userEvent.keyboard("{End}");
      expect(bodyRows()[3]).toHaveFocus();

      await userEvent.keyboard("{Home}");
      expect(bodyRows()[0]).toHaveFocus();
    });

    it("says which row is chosen, and not only in a colour", () => {
      // The selection was a background class, which is nothing to a reader who
      // is not looking at it — and a colour alone is a WCAG 1.4.1 failure.
      render(
        <DataTable types={types} columns={columns} rows={rows} selected={rows[1]} rowKey="id" onRowClick={vi.fn()} />,
      );

      expect(body().getAllByRole("row", { selected: true })).toHaveLength(1);
      expect(bodyRows()[1]).toHaveAttribute("aria-selected", "true");
      expect(bodyRows()[0]).toHaveAttribute("aria-selected", "false");
    });
  });

  /**
   * A column whose cells explain themselves (a star, a checkbox) still owes its
   * header a name: an empty `th` tells a screen reader nothing about the cells
   * under it (axe `empty-table-header`). `labelHidden` keeps the name and hides
   * the text.
   */
  describe("a hidden column label", () => {
    it("names the header for assistive technology while drawing no text", () => {
      render(
        <DataTable
          types={{ ...types, firstName: { label: "First name", labelHidden: true } }}
          columns={columns}
          rows={rows}
        />,
      );

      const header = screen.getByRole("columnheader", { name: "First name" });
      expect(header.querySelector(".sr-only")).toHaveTextContent("First name");
    });
  });

  /**
   * A row is named by one of its cells, the way a person reads it: "Coltrane,
   * Saxophone" rather than "row 1". Without a row header a screen reader has no
   * cell to announce when moving down a column, so each value arrives without
   * the row it belongs to.
   */
  describe("row headers", () => {
    const withHeader: Record<string, Column> = {
      ...types,
      lastName: { label: "Last name", rowHeader: true },
    };
    const body = () => within(screen.getAllByRole("rowgroup")[1]);

    it("draws the column it is asked to as the header of each row", () => {
      render(<DataTable types={withHeader} columns={columns} rows={rows} />);

      const headers = body().getAllByRole("rowheader");
      expect(headers.map((cell) => cell.textContent)).toEqual(["Coltrane", "Davis", "Monk", "Mingus"]);
      for (const cell of headers) {
        expect(cell.tagName).toBe("TH");
        expect(cell).toHaveAttribute("scope", "row");
      }
    });

    it("keeps every other cell a cell", () => {
      render(<DataTable types={withHeader} columns={columns} rows={rows} />);

      expect(body().getAllByRole("cell")).toHaveLength(rows.length * (columns.length - 1));
    });

    it("is one in a grid too, which is where rows are moved between", () => {
      render(<DataTable types={withHeader} columns={columns} rows={rows} onRowClick={() => {}} />);

      expect(body().getAllByRole("rowheader")).toHaveLength(rows.length);
      expect(body().getAllByRole("cell")).toHaveLength(rows.length * (columns.length - 1));
    });

    it("leaves the keyboard as it was: one tab stop, arrows between rows", async () => {
      const user = userEvent.setup();
      render(<DataTable types={withHeader} columns={columns} rows={rows} onRowClick={() => {}} />);

      await user.tab();
      expect(body().getAllByRole("row")[0]).toHaveFocus();
      await user.keyboard("{ArrowDown}");
      expect(body().getAllByRole("row")[1]).toHaveFocus();
      expect(
        body()
          .getAllByRole("rowheader")
          .every((cell) => !cell.hasAttribute("tabindex")),
      ).toBe(true);
    });

    it("draws no row header unless a column asks for one", () => {
      render(<DataTable types={types} columns={columns} rows={rows} />);

      expect(body().queryAllByRole("rowheader")).toEqual([]);
    });
  });

  /**
   * What `columnsFor` promises the compiler is asserted in `DataTable.test-d.tsx`,
   * where it belongs: it is a typing helper and the defect it answers is a typing
   * defect. What is asserted here is the half a type check cannot see -- that
   * what it hands back is a column this component actually reads.
   */
  describe("columnsFor", () => {
    interface Musician extends Record<string, unknown> {
      id: number;
      firstName: string;
      lastName: string;
    }

    const column = columnsFor<Musician>();

    it("builds columns the table reads like any other", () => {
      render(
        <DataTable<Musician>
          types={{
            name: column({
              label: "Name",
              get: (row) => `${row.firstName} ${row.lastName}`,
              format: (name) => name.toUpperCase(),
            }),
          }}
          columns={["name"]}
          rows={rows}
          rowKey="id"
        />,
      );

      expect(screen.getByText("JOHN COLTRANE")).toBeInTheDocument();
    });

    it("hands back the column it was given, adding nothing", () => {
      // An identity function, deliberately: it exists to give inference
      // somewhere to happen, and a helper that quietly filled in a default
      // would be doing something the type does not say.
      const spec = { label: "Name", get: (row: Musician) => row.firstName };

      expect(column(spec)).toBe(spec);
    });
  });
});
