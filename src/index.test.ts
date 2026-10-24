import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const entry = resolve(__dirname, "index.ts");

/** Components that take no props worth naming; each entry is a decision. */
const NO_PROPS_NEEDED = new Set<string>([]);

function rootExports(): { components: string[]; names: Set<string> } {
  const root = resolve(__dirname, "..");
  const config = ts.readConfigFile(resolve(root, "tsconfig.app.json"), ts.sys.readFile).config;
  const options = ts.parseJsonConfigFileContent(config, ts.sys, root).options;
  const program = ts.createProgram([entry], options);
  const checker = program.getTypeChecker();
  const exports = checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry)!)!);

  const isComponent = (symbol: ts.Symbol): boolean => {
    if (!/^[A-Z][a-z]/.test(symbol.name)) return false;
    const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    if (!(resolved.flags & ts.SymbolFlags.Value)) return false;
    const type = checker.getTypeOfSymbol(resolved);
    return type.getCallSignatures().length > 0 || type.getProperty("$$typeof") !== undefined;
  };

  return {
    components: exports.filter(isComponent).map((symbol) => symbol.name),
    names: new Set(exports.map((symbol) => symbol.name)),
  };
}

describe("root entry", () => {
  const { components, names } = rootExports();

  it("exports components from every layer", () => {
    expect(components).toEqual(expect.arrayContaining(["Button", "RequestMethodBadge", "TpdexBadge", "OverviewPage"]));
  });

  it("exports a Props type for every component", () => {
    const missing = components.filter((name) => !NO_PROPS_NEEDED.has(name) && !names.has(`${name}Props`));
    expect(missing).toEqual([]);
  });

  it("keeps the allowlist free of stale entries", () => {
    const stale = [...NO_PROPS_NEEDED].filter((name) => !components.includes(name) || names.has(`${name}Props`));
    expect(stale).toEqual([]);
  });
});
