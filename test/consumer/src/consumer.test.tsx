import { Badge } from "@msqd/lydia";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { charts } from "./charts.js";

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

it("renders the root entry under vitest and jsdom", () => {
  render(<Badge>Healthy</Badge>);
  expect(screen.getByText("Healthy")).toBeTruthy();
});

it.each(Object.entries(charts))("renders %s under vitest and jsdom", async (_name, chart) => {
  const { container, unmount } = render(chart);
  expect(container.firstElementChild).not.toBeNull();

  // jsdom has no canvas: dispose the chart before zrender's deferred paint can reach it.
  unmount();
  await new Promise((resolve) => setTimeout(resolve, 100));
});
