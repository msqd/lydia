import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CacheIndicator } from "./CacheIndicator";

// The icons render for real. Mocking them made these tests assert that a stand-in received the
// size and colour classes, which says nothing about whether the real icon does. Mock only what
// this component hands no props to. See Testing.mdx, What to mock.

const iconsOf = (indicator: HTMLElement) => Array.from(indicator.querySelectorAll("svg"));

describe("CacheIndicator", () => {
  // Each "renders nothing" case renders a hit alongside it: an assertion that something is absent
  // also passes when the component stopped rendering anything at all.
  it("renders nothing when no cache information is provided", () => {
    render(
      <>
        <CacheIndicator cacheStatus="hit" />
        <CacheIndicator />
      </>,
    );

    expect(screen.getAllByLabelText(/^Cache /)).toHaveLength(1);
    expect(screen.getByLabelText("Cache HIT - Response served from cache")).toBeInTheDocument();
  });

  it("renders nothing when cached is false (cache miss)", () => {
    render(
      <>
        <CacheIndicator cacheStatus="hit" />
        <CacheIndicator cached={false} />
      </>,
    );

    expect(screen.getAllByLabelText(/^Cache /)).toHaveLength(1);
    expect(screen.getByLabelText("Cache HIT - Response served from cache")).toBeInTheDocument();
  });

  it("renders nothing for cache miss", () => {
    render(
      <>
        <CacheIndicator cacheStatus="hit" />
        <CacheIndicator cacheStatus="miss" />
      </>,
    );

    expect(screen.getAllByLabelText(/^Cache /)).toHaveLength(1);
    expect(screen.getByLabelText("Cache HIT - Response served from cache")).toBeInTheDocument();
  });

  it("renders cache hit indicator", () => {
    render(<CacheIndicator cacheStatus="hit" />);
    const indicator = screen.getByLabelText("Cache HIT - Response served from cache");
    const [icon, crossOut] = iconsOf(indicator);
    expect(indicator).toBeInTheDocument();
    expect(icon).toHaveClass("text-success-600");
    expect(indicator).toHaveAttribute("title", "Cache HIT - Response served from cache");
    expect(crossOut).toBeUndefined();
  });

  it("renders cache stale indicator", () => {
    render(<CacheIndicator cacheStatus="stale" />);
    const indicator = screen.getByLabelText("Cache STALE - Served stale content while revalidating");
    const [icon, crossOut] = iconsOf(indicator);
    expect(indicator).toBeInTheDocument();
    expect(icon).toHaveClass("text-warning-600");
    expect(indicator).toHaveAttribute("title", "Cache STALE - Served stale content while revalidating");
    expect(crossOut).toBeUndefined();
  });

  it("renders cache bypass indicator with cross-out", () => {
    render(<CacheIndicator cacheStatus="bypass" />);
    const indicator = screen.getByLabelText("Cache BYPASS - Cache was intentionally bypassed");
    const [icon, crossOut] = iconsOf(indicator);
    expect(indicator).toBeInTheDocument();
    expect(icon).toHaveClass("text-danger-600");
    expect(crossOut).toHaveClass("text-danger-600");
    expect(indicator).toHaveAttribute("title", "Cache BYPASS - Cache was intentionally bypassed");
  });

  it("supports legacy cached boolean (true)", () => {
    render(<CacheIndicator cached={true} />);
    const indicator = screen.getByLabelText("Cache HIT - Response served from cache");
    const [icon] = iconsOf(indicator);
    expect(indicator).toBeInTheDocument();
    expect(icon).toHaveClass("text-success-600");
    expect(indicator).toHaveAttribute("title", "Cache HIT - Response served from cache");
  });

  it.each([
    ["xs", "h-3 w-3"],
    ["sm", "h-3.5 w-3.5"],
    ["base", "h-4 w-4"],
    ["lg", "h-5 w-5"],
  ] as const)("sizes the real icon for size %s", (size, expected) => {
    render(<CacheIndicator cacheStatus="hit" size={size} />);

    const [icon] = iconsOf(screen.getByLabelText("Cache HIT - Response served from cache"));
    expect(icon).toHaveClass(expected);
  });

  it("applies custom className", () => {
    render(<CacheIndicator cacheStatus="hit" className="custom-class" />);
    expect(screen.getByLabelText("Cache HIT - Response served from cache")).toHaveClass("custom-class");
  });

  it("includes aria-label for accessibility", () => {
    render(<CacheIndicator cacheStatus="hit" />);
    const indicator = screen.getByLabelText("Cache HIT - Response served from cache");
    expect(indicator).toHaveAttribute("aria-label", "Cache HIT - Response served from cache");
  });

  /**
   * An `aria-label` on a plain `span` is prohibited and read by nothing: the
   * span has no role for a name to belong to (axe `aria-prohibited-attr`). An
   * icon that carries a status is an image, and the name is its alt text.
   */
  it("is an image named by its status, which a screen reader announces", () => {
    render(<CacheIndicator cacheStatus="stale" />);

    expect(
      screen.getByRole("img", { name: "Cache STALE - Served stale content while revalidating" }),
    ).toBeInTheDocument();
  });
});
