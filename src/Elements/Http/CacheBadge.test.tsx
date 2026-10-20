import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CacheBadge } from "./CacheBadge";

describe("CacheBadge", () => {
  it("renders cache hit status", () => {
    render(<CacheBadge cacheStatus="hit" />);
    const badge = screen.getByTitle("Cache HIT");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("HIT");
    expect(badge).toHaveClass("bg-success-50", "text-success-700", "ring-success-600/20");
  });

  it("renders cache miss status", () => {
    render(<CacheBadge cacheStatus="miss" />);
    const badge = screen.getByTitle("Cache MISS");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("MISS");
    expect(badge).toHaveClass("bg-gray-50", "text-gray-700", "ring-gray-600/20");
  });

  it("renders cache stale status", () => {
    render(<CacheBadge cacheStatus="stale" />);
    const badge = screen.getByTitle("Cache STALE");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("STALE");
    expect(badge).toHaveClass("bg-warning-50", "text-warning-700", "ring-warning-600/20");
  });

  it("renders cache bypass status", () => {
    render(<CacheBadge cacheStatus="bypass" />);
    const badge = screen.getByTitle("Cache BYPASS");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("BYPASS");
    expect(badge).toHaveClass("bg-blue-50", "text-blue-700", "ring-blue-600/20");
  });

  it("renders for legacy cached=true", () => {
    render(<CacheBadge cached={true} />);
    const badge = screen.getByTitle("Cached");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("HIT");
    expect(badge).toHaveClass("bg-success-50", "text-success-700", "ring-success-600/20");
  });

  // Each "returns null" case renders a hit alongside it: an assertion that something is absent
  // also passes when the component stopped rendering anything at all. Nothing reported is not a
  // miss, and neither is drawn, so the two are told apart by the filter rather than here. See #100.
  it("returns null when no cache information", () => {
    render(
      <>
        <CacheBadge cacheStatus="hit" />
        <CacheBadge />
      </>,
    );

    expect(screen.getAllByText(/^(HIT|MISS|STALE|BYPASS)$/)).toHaveLength(1);
    expect(screen.getByText("HIT")).toBeInTheDocument();
  });

  it("returns null when cached=false", () => {
    render(
      <>
        <CacheBadge cacheStatus="hit" />
        <CacheBadge cached={false} />
      </>,
    );

    expect(screen.getAllByText(/^(HIT|MISS|STALE|BYPASS)$/)).toHaveLength(1);
    expect(screen.getByText("HIT")).toBeInTheDocument();
  });

  it("renders at the Badge canonical inline size", () => {
    render(<CacheBadge cacheStatus="hit" />);
    const badge = screen.getByTitle("Cache HIT");
    expect(badge).toHaveClass("text-xs");
  });

  it("applies custom className", () => {
    render(<CacheBadge cacheStatus="hit" className="custom-class" />);
    const badge = screen.getByTitle("Cache HIT");
    expect(badge).toHaveClass("custom-class", "font-mono");
  });
});
