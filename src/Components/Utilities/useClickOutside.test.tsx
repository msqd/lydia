import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type ClickOutsideIgnore, useClickOutside } from "./useClickOutside";

function Fixture({
  onOutside,
  enabled = true,
  ignore,
}: {
  onOutside: () => void;
  enabled?: boolean;
  ignore?: readonly ClickOutsideIgnore[];
}) {
  const ref = useClickOutside<HTMLDivElement>({ onClickOutside: onOutside, enabled, ignore });
  return (
    <div>
      <div ref={ref}>
        <button>inside</button>
      </div>
      <button>outside</button>
      <button className="keep">ignored</button>
    </div>
  );
}

const subscriptions = (spy: { mock: { calls: unknown[][] } }, type = "mousedown") =>
  spy.mock.calls.filter(([name]) => name === type).length;

describe("useClickOutside", () => {
  afterEach(() => vi.restoreAllMocks());

  it("calls the handler once per outside click", () => {
    const onOutside = vi.fn();
    render(<Fixture onOutside={onOutside} />);

    fireEvent.mouseDown(screen.getByText("outside"));

    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it("also reacts to touches", () => {
    const onOutside = vi.fn();
    render(<Fixture onOutside={onOutside} />);

    fireEvent.touchStart(screen.getByText("outside"));

    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it("ignores clicks inside the returned ref", () => {
    const onOutside = vi.fn();
    render(<Fixture onOutside={onOutside} />);

    fireEvent.mouseDown(screen.getByText("inside"));

    expect(onOutside).not.toHaveBeenCalled();
  });

  it("ignores clicks on an element matching an ignored selector", () => {
    const onOutside = vi.fn();
    render(<Fixture onOutside={onOutside} ignore={[".keep"]} />);

    fireEvent.mouseDown(screen.getByText("ignored"));
    expect(onOutside).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByText("outside"));
    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it("ignores nothing by default", () => {
    const onOutside = vi.fn();
    render(
      <>
        <div role="dialog">
          <button>in a dialog</button>
        </div>
        <Fixture onOutside={onOutside} />
      </>,
    );

    fireEvent.mouseDown(screen.getByText("in a dialog"));

    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it("ignores clicks inside an ignored ref", () => {
    const onOutside = vi.fn();
    const other = { current: null as HTMLElement | null };
    render(
      <>
        <div
          ref={(node) => {
            other.current = node;
          }}
        >
          <button>other</button>
        </div>
        <Fixture onOutside={onOutside} ignore={[other]} />
      </>,
    );

    fireEvent.mouseDown(screen.getByText("other"));

    expect(onOutside).not.toHaveBeenCalled();
  });

  it("does not react while disabled", () => {
    const onOutside = vi.fn();
    render(<Fixture onOutside={onOutside} enabled={false} />);

    fireEvent.mouseDown(screen.getByText("outside"));

    expect(onOutside).not.toHaveBeenCalled();
  });

  it("subscribes on the document only, once per event type, and only while enabled", () => {
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");
    const windowAdd = vi.spyOn(window, "addEventListener");
    const { rerender } = render(<Fixture onOutside={vi.fn()} enabled={false} />);
    expect(subscriptions(add)).toBe(0);

    rerender(<Fixture onOutside={vi.fn()} enabled />);
    expect(subscriptions(add)).toBe(1);
    expect(subscriptions(add, "touchstart")).toBe(1);

    rerender(<Fixture onOutside={vi.fn()} enabled ignore={[".keep"]} />);
    rerender(<Fixture onOutside={vi.fn()} enabled ignore={[".keep"]} />);
    expect(subscriptions(add)).toBe(1);
    expect(subscriptions(remove)).toBe(0);
    expect(subscriptions(windowAdd)).toBe(0);

    rerender(<Fixture onOutside={vi.fn()} enabled={false} />);
    expect(subscriptions(remove)).toBe(1);
  });

  it("calls the latest handler without re-subscribing", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Fixture onOutside={first} />);
    rerender(<Fixture onOutside={second} />);

    fireEvent.mouseDown(screen.getByText("outside"));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("stops listening on unmount", () => {
    const onOutside = vi.fn();
    const { unmount } = renderHook(() => useClickOutside({ onClickOutside: onOutside }));
    unmount();

    fireEvent.mouseDown(document.body);

    expect(onOutside).not.toHaveBeenCalled();
  });
});
