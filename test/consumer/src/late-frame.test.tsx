import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { charts } from "./charts.js";

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// Vitest calls vi.restoreAllMocks() when a test file ends, while zrender may still have a frame to paint.
it("paints a frame that fires after the mocks are restored", async () => {
  vi.useFakeTimers();
  try {
    const errors: unknown[] = [];
    const record = (event: ErrorEvent) => errors.push(event.error);
    window.addEventListener("error", record);
    render(charts.TransactionsChart);
    vi.restoreAllMocks();
    await vi.advanceTimersByTimeAsync(1000);
    window.removeEventListener("error", record);
    expect(errors).toEqual([]);
  } finally {
    vi.useRealTimers();
  }
});
