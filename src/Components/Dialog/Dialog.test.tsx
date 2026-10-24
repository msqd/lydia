import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";
import { Drawer } from "./Drawer";

describe("Dialog Component", () => {
  it("locks page scroll while open and gives it back, in place, on close", () => {
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    const scrollTo = vi.fn();
    Object.defineProperty(window, "scrollTo", { value: scrollTo, writable: true });

    const { rerender } = render(
      <Dialog isOpen={true} onClose={vi.fn()} title="Test">
        Content
      </Dialog>,
    );
    expect(document.documentElement.style.overflow).toBe("hidden");

    rerender(
      <Dialog isOpen={false} onClose={vi.fn()} title="Test">
        Content
      </Dialog>,
    );

    expect(document.documentElement.style.overflow).toBe("");
    expect(window.scrollY).toBe(100);
    expect(scrollTo).not.toHaveBeenCalledWith(0, 0);
  });

  it("keeps the page locked until a Dialog opened over a Drawer and the Drawer are both closed", () => {
    const renderStack = (drawerOpen: boolean, dialogOpen: boolean) => (
      <Drawer isOpen={drawerOpen} onClose={vi.fn()} title="Drawer">
        <Dialog isOpen={dialogOpen} onClose={vi.fn()} title="Dialog">
          Content
        </Dialog>
      </Drawer>
    );

    const { rerender } = render(renderStack(true, true));
    expect(document.documentElement.style.overflow).toBe("hidden");

    rerender(renderStack(true, false));
    expect(document.documentElement.style.overflow).toBe("hidden");

    rerender(renderStack(false, false));
    expect(document.documentElement.style.overflow).toBe("");
  });
});
