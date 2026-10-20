import { describe, expect, it } from "vitest";
import { type FacetOption, type NestedOption, readSelection, toggleCode, writeSelection } from "./nestedValues";

const status: FacetOption[] = [{ name: "4", under: [{ name: "400" }, { name: "422" }] }];

const paths: FacetOption[] = [
  { name: "api", under: [{ name: "api/x" }] },
  { name: "api2", under: [{ name: "api2/x" }] },
];

const roundTrip = (values: string[], options: FacetOption[]) =>
  writeSelection(readSelection(values, options), options, values);

describe("unlisted exclusions: which class owns one", () => {
  it("reads an unlisted code of the class as an exclusion", () => {
    expect(readSelection(["4", "-404"], status)).toEqual([{ kind: "minus", excluded: ["404"] }]);
  });

  it("does not read a label as a code: ['4', '-4xx'] stays the whole class", () => {
    expect(readSelection(["4", "-4xx"], status)).toEqual([{ kind: "whole" }]);
  });

  it("keeps a value no class owns, once", () => {
    expect(roundTrip(["4", "-4xx"], status)).toEqual(["4", "-4xx"]);
  });

  it("gives a code to the longest class name that prefixes it", () => {
    expect(readSelection(["api", "api2", "-api2/y"], paths)).toEqual([
      { kind: "whole" },
      { kind: "minus", excluded: ["api2/y"] },
    ]);
  });

  it("writes each token once", () => {
    expect(roundTrip(["api", "-api2/y", "api2", "-api2/y"], paths)).toEqual(["api", "api2", "-api2/y"]);
  });
});

describe("toggling a code under an open class", () => {
  const client: NestedOption = { name: "4", under: [{ name: "404" }] };

  it("re-including an unlisted code never clears the class", () => {
    const state = readSelection(["4", "-404", "-499"], [client])[0];
    const next = toggleCode(state, client, "499");

    expect(next).toEqual({ kind: "minus", excluded: ["404"] });
    expect(writeSelection([next], [client], [])).toEqual(["4", "-404"]);
  });

  it("excluding the last kept listed code still clears the class", () => {
    const state = readSelection(["4", "-499"], [client])[0];

    expect(toggleCode(state, client, "404")).toEqual({ kind: "none" });
  });
});
