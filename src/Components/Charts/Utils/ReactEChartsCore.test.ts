import { afterEach, describe, expect, it, vi } from "vitest";

const Component = () => null;

describe("ReactEChartsCore", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("echarts-for-react/lib/core.js");
  });

  it("is the component when the default import is the component, as with a bundler", async () => {
    vi.doMock("echarts-for-react/lib/core.js", () => ({ default: Component }));

    expect((await import("./ReactEChartsCore")).ReactEChartsCore).toBe(Component);
  });

  it("unwraps the CommonJS `module.exports` Node ESM gives as the default import", async () => {
    vi.doMock("echarts-for-react/lib/core.js", () => ({ default: { default: Component, __esModule: true } }));

    expect((await import("./ReactEChartsCore")).ReactEChartsCore).toBe(Component);
  });
});
