import { describe, expect, it } from "vitest";
import { readArray, readDates, readRange, readSingle } from "./read";
import type { Filters } from "./types";

/** A URL parser or an untyped caller can hand over any shape, whatever `Filters` says. */
type Case = [value: unknown, expected: unknown];

/** Valid shapes first, then every shape the reader must refuse, all reading as the empty value. */
const cases = (valid: Case[], refused: unknown[], empty: unknown): Case[] => [
  ...valid,
  ...refused.map((value): Case => [value, empty]),
];

const filtersWith = (value: unknown) => ({ f: value }) as unknown as Filters;

describe("readArray", () => {
  it.each(
    cases(
      [
        [
          ["a", "b"],
          ["a", "b"],
        ],
        [undefined, []],
      ],
      [null, 42, true, "text", {}, { min: 1 }, ["a", 1], [null]],
      [],
    ),
  )("reads %j as %j", (value, expected) => {
    expect(readArray(filtersWith(value), "f")).toEqual(expected);
  });

  it("reads an absent filters object or name as empty", () => {
    expect(readArray(undefined, "f")).toEqual([]);
    expect(readArray({}, "f")).toEqual([]);
  });
});

describe("readRange", () => {
  it.each(
    cases(
      [
        [
          { min: 1, max: 9 },
          { min: 1, max: 9 },
        ],
        [{ min: 0 }, { min: 0 }],
        [{ max: 5 }, { max: 5 }],
        [{ min: "1", max: 9 }, { max: 9 }],
        [{ min: Number.NaN }, {}],
        [undefined, {}],
      ],
      [null, 42, true, "text", ["a"], { startDate: "2025-01-01" }],
      {},
    ),
  )("reads %j as %j", (value, expected) => {
    expect(readRange(filtersWith(value), "f")).toEqual(expected);
  });

  it("reads an absent filters object as empty", () => {
    expect(readRange(undefined, "f")).toEqual({});
  });
});

describe("readDates", () => {
  it.each(
    cases(
      [
        [
          { startDate: "2025-01-01", endDate: "2025-02-01" },
          { startDate: "2025-01-01", endDate: "2025-02-01" },
        ],
        [{ startDate: "2025-01-01" }, { startDate: "2025-01-01" }],
        [{ startDate: 3, endDate: "2025-02-01" }, { endDate: "2025-02-01" }],
        [undefined, {}],
      ],
      [null, 42, true, "text", ["a"], { min: 1 }],
      {},
    ),
  )("reads %j as %j", (value, expected) => {
    expect(readDates(filtersWith(value), "f")).toEqual(expected);
  });

  it("reads an absent filters object as empty", () => {
    expect(readDates(undefined, "f")).toEqual({});
  });
});

describe("readSingle", () => {
  it.each(
    cases(
      [
        ["GET", "GET"],
        ["", ""],
        [undefined, undefined],
      ],
      [null, 42, true, ["a"], {}],
      undefined,
    ),
  )("reads %j as %j", (value, expected) => {
    expect(readSingle(filtersWith(value), "f")).toBe(expected);
  });

  it("reads an absent filters object as empty", () => {
    expect(readSingle(undefined, "f")).toBeUndefined();
  });
});
