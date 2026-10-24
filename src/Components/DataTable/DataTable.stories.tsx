import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect } from "storybook/test";
import { DataTable, columnsFor } from "./DataTable";
import type { BaseRow, Column } from "./DataTable";

interface Musician extends BaseRow {
  firstName: string;
  lastName: string;
  instrument: string;
  country: string;
}

const musicians: Musician[] = [
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
  },
];

const musicianColumn = columnsFor<Musician>();

const musicianTypes: Record<string, Column<Musician, unknown>> = {
  firstName: { label: "First name" },
  lastName: { label: "Last name" },
  instrument: { label: "Instrument" },
  country: { label: "Country" },
};

const meta = {
  title: "Components/DataTable/DataTable",
  component: DataTable<Musician>,
  tags: ["autodocs"],
  args: {
    rows: musicians,
    types: musicianTypes,
    columns: ["firstName", "lastName", "instrument", "country"],
    rowKey: "firstName",
  },
  argTypes: {
    rows: {
      description: "Array of data objects to be displayed in the table",
      control: { type: "object" },
    },
    types: {
      description: "Configuration for each column",
      control: { type: "object" },
    },
    columns: {
      description: "Array of column keys to display (in order)",
      control: { type: "object" },
    },
    onRowClick: {
      description: "Function to call when a row is clicked",
      action: "row clicked",
    },
    selected: {
      description: "Currently selected row",
      control: { type: "object" },
    },
    rowKey: {
      description: "Property used to identify rows for selection",
      control: { type: "text" },
    },
  },
} satisfies Meta<typeof DataTable<Musician>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: {
    selected: musicians[2],
    rowKey: "firstName",
    onRowClick: (row: unknown) => console.log("Row clicked:", row),
  },
};

export const InteractiveSelection: Story = {
  render: () => {
    const [selectedMusician, setSelectedMusician] = React.useState<Musician>(musicians[0]);

    return (
      <div>
        <p className="mb-4">
          <strong>Selected musician:</strong> {selectedMusician.firstName} {selectedMusician.lastName}
        </p>
        <DataTable
          rows={musicians}
          types={musicianTypes}
          columns={["firstName", "lastName", "instrument", "country"]}
          selected={selectedMusician}
          rowKey="firstName"
          onRowClick={(row) => setSelectedMusician(row as Musician)}
        />
      </div>
    );
  },
};

// Selection driven from the keyboard alone, which is the one way this table
// could not be operated before.
export const KeyboardSelection: Story = {
  render: () => {
    const [selectedMusician, setSelectedMusician] = React.useState<Musician | undefined>(undefined);

    return (
      <div>
        <p className="mb-4 text-sm text-gray-600">
          Put the mouse down. <kbd>Tab</kbd> reaches the table — once, not once per row — then <kbd>↑</kbd> <kbd>↓</kbd>{" "}
          <kbd>Home</kbd> <kbd>End</kbd> move between rows and <kbd>Enter</kbd> or <kbd>Space</kbd> chooses one. Tab
          again and the table is behind you; come back and focus returns to the row you chose, not to the top.
        </p>
        <p className="mb-4">
          <strong>Selected musician:</strong>{" "}
          {selectedMusician ? `${selectedMusician.firstName} ${selectedMusician.lastName}` : "none yet"}
        </p>
        <DataTable
          rows={musicians}
          types={musicianTypes}
          columns={["firstName", "lastName", "instrument", "country"]}
          selected={selectedMusician}
          rowKey="firstName"
          onRowClick={(row) => setSelectedMusician(row as Musician)}
        />
        <p className="mt-6 text-sm text-gray-600">
          The same table without <code>onRowClick</code>: no tab stop, no pointer cursor, and it stays a plain table
          rather than announcing itself as a grid nobody can operate.
        </p>
        <DataTable
          rows={musicians}
          types={musicianTypes}
          columns={["firstName", "lastName", "instrument", "country"]}
        />
      </div>
    );
  },
};

// Built through `columnsFor`, which is what lets `format` see what `get`
// returned. Written straight into the map, the value arrives as `unknown` and
// has to be cast back to something renderable -- which is a cast that asserts
// rather than checks, and this story carried one until the helper existed.
export const CustomFormatting: Story = {
  args: {
    types: {
      ...musicianTypes,
      instrument: musicianColumn({
        label: "Instrument",
        get: (row) => row.instrument,
        format: (instrument) => <span className="font-bold text-blue-600">{instrument}</span>,
      }),
      country: {
        label: "Country",
        className: "text-emerald-600",
        headerClassName: "bg-emerald-50",
      },
    },
  },
};

export const ClickableColumns: Story = {
  args: {
    types: {
      ...musicianTypes,
      lastName: {
        ...musicianTypes.lastName,
        onClick: (row: unknown) => {
          const musician = row as Musician;
          alert(`Selected musician: ${musician.firstName} ${musician.lastName}`);
        },
        className: "cursor-pointer text-blue-600 hover:underline",
      },
    },
  },
};

/**
 * A table with a name, which is what a page holding more than one of them needs.
 *
 * `DataTableProps` extends `ComponentProps<"table">`, so anything a `<table>`
 * takes now reaches the element — `aria-label` here, but equally `id` or a
 * class of the caller's own. Without it every table on a page is announced as
 * an unlabelled "table", or an unlabelled "grid" once its rows can be chosen,
 * and a reader listing them cannot tell one from another.
 *
 * No tool reports this: nothing requires a grid to be named, so an axe run
 * stays clean either way. It is a navigation cost rather than a violation,
 * which is why it went unnoticed.
 */
export const Named: Story = {
  args: {
    "aria-label": "Musicians",
  },
};

/**
 * The last name heads each row, `<th scope="row">`, so a screen reader moving
 * down the Instrument column says "Davis, Trumpet" rather than "Trumpet".
 *
 * It looks like every other cell. A row header is structure, not emphasis, and
 * a browser's own `th` style (bold, centred) would make one column shout.
 */
export const RowHeaders: Story = {
  args: {
    "aria-label": "Musicians",
    types: { ...musicianTypes, lastName: { label: "Last name", rowHeader: true } },
  },
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector('tbody th[scope="row"]');
    const cell = header?.parentElement?.querySelector("td");
    if (!header || !cell) throw new Error("no row header drawn beside a cell");

    const look = (element: Element) => {
      const { fontWeight, textAlign, paddingTop, paddingLeft, color, fontSize } = getComputedStyle(element);
      return { fontWeight, textAlign, paddingTop, paddingLeft, color, fontSize };
    };
    await expect(look(header)).toEqual(look(cell));
  },
};
