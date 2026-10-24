import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useVirtualization } from "./useVirtualization";

const config = { itemHeight: 20, containerHeight: 100, overscan: 0, virtualizationThreshold: 10 };

function Harness({ totalItems, onRender }: { totalItems: number; onRender?: () => void }) {
  const { isVirtualized, startIndex, endIndex, onScroll } = useVirtualization(totalItems, config);
  onRender?.();
  return (
    <div data-testid="box" onScroll={onScroll}>
      {isVirtualized ? "virtual" : "plain"} {startIndex}-{endIndex}
    </div>
  );
}

const scrollTo = (scrollTop: number) => {
  const box = screen.getByTestId("box");
  box.scrollTop = scrollTop;
  fireEvent.scroll(box);
};

describe("useVirtualization", () => {
  it("does not virtualize below the threshold", () => {
    render(<Harness totalItems={5} />);
    expect(screen.getByTestId("box")).toHaveTextContent("plain 0-4");
  });

  it("moves the window with the scroll position", () => {
    render(<Harness totalItems={1000} />);
    expect(screen.getByTestId("box")).toHaveTextContent("virtual 0-5");

    scrollTo(400);
    expect(screen.getByTestId("box")).toHaveTextContent("virtual 20-25");
  });

  it("updates once per scroll event", () => {
    const onRender = vi.fn();
    render(<Harness totalItems={1000} onRender={onRender} />);
    onRender.mockClear();

    scrollTo(400);
    expect(onRender).toHaveBeenCalledTimes(1);
  });

  it("subscribes to scroll once", () => {
    const add = vi.spyOn(HTMLElement.prototype, "addEventListener");
    render(<Harness totalItems={1000} />);

    const box = screen.getByTestId("box");
    const subscriptions = add.mock.calls.filter(([type], call) => type === "scroll" && add.mock.contexts[call] === box);
    expect(subscriptions).toHaveLength(1);
    add.mockRestore();
  });
});
