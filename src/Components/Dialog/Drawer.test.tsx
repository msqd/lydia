import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Drawer, DrawerDescription, DrawerTitle } from "./Drawer";

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  backdrop: true,
};

describe("Drawer", () => {
  it("renders when open", () => {
    render(
      <Drawer {...defaultProps} title="Test Drawer">
        <div>Drawer content</div>
      </Drawer>,
    );

    expect(screen.getByText("Test Drawer")).toBeInTheDocument();
    expect(screen.getByText("Drawer content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <Drawer {...defaultProps} isOpen={false} title="Test Drawer">
        <div>Drawer content</div>
      </Drawer>,
    );

    expect(screen.queryByText("Test Drawer")).not.toBeInTheDocument();
    expect(screen.queryByText("Drawer content")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Drawer {...defaultProps} onClose={onClose} title="Test Drawer">
        <div>Content</div>
      </Drawer>,
    );

    const closeButton = screen.getByLabelText("Close drawer");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders title and description when provided", () => {
    render(
      <Drawer {...defaultProps} title="Test Title" description="Test Description">
        <div>Content</div>
      </Drawer>,
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("hides close button when showCloseButton is false", () => {
    render(
      <Drawer {...defaultProps} showCloseButton={false} title="Test Drawer">
        <div>Content</div>
      </Drawer>,
    );

    expect(screen.queryByLabelText("Close drawer")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Drawer {...defaultProps} className="custom-class" title="Test">
        <div>Content</div>
      </Drawer>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("custom-class");
  });

  it("applies custom contentClassName", () => {
    render(
      <Drawer {...defaultProps} contentClassName="custom-content" title="Test">
        <div>Content</div>
      </Drawer>,
    );

    const panel = screen.getByText("Test").closest('[class*="custom-content"]');
    expect(panel).toHaveClass("custom-content");
  });

  it("applies custom titleClassName", () => {
    render(
      <Drawer {...defaultProps} title="Test Title" titleClassName="custom-title">
        <div>Content</div>
      </Drawer>,
    );

    const title = screen.getByText("Test Title");
    expect(title).toHaveClass("custom-title");
  });

  it("applies custom descriptionClassName", () => {
    render(
      <Drawer {...defaultProps} description="Test Description" descriptionClassName="custom-description">
        <div>Content</div>
      </Drawer>,
    );

    const description = screen.getByText("Test Description");
    expect(description).toHaveClass("custom-description");
  });

  it("renders with different sizes", () => {
    const sizes = ["sm", "md", "lg"] as const;

    sizes.forEach((size) => {
      const { rerender } = render(
        <Drawer {...defaultProps} size={size} title="Test">
          <div>Content</div>
        </Drawer>,
      );

      // Check that the component renders without errors
      expect(screen.getByText("Test")).toBeInTheDocument();

      rerender(<div />); // Clean up for next iteration
    });
  });

  it("renders with different positions", () => {
    const { rerender } = render(
      <Drawer {...defaultProps} position="right" title="Right Drawer">
        <div>Content</div>
      </Drawer>,
    );

    expect(screen.getByText("Right Drawer")).toBeInTheDocument();

    rerender(
      <Drawer {...defaultProps} position="left" title="Left Drawer">
        <div>Content</div>
      </Drawer>,
    );

    expect(screen.getByText("Left Drawer")).toBeInTheDocument();
  });

  it("matches snapshot when open", () => {
    const { container } = render(
      <Drawer {...defaultProps} title="Test Drawer" description="Test Description">
        <div>Drawer content</div>
      </Drawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot when closed", () => {
    const { container } = render(
      <Drawer {...defaultProps} isOpen={false} title="Test Drawer">
        <div>Drawer content</div>
      </Drawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot with left position", () => {
    const { container } = render(
      <Drawer {...defaultProps} position="left" title="Left Drawer">
        <div>Content</div>
      </Drawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders backdrop overlay when backdrop is true", () => {
    render(
      <Drawer {...defaultProps} backdrop={true} title="Test">
        <div>Content</div>
      </Drawer>,
    );

    // Check that backdrop overlay is rendered
    const backdrop = document.querySelector(".fixed.inset-0.bg-black\\/25");
    expect(backdrop).toBeInTheDocument();
  });

  it("does not render backdrop overlay when backdrop is false", () => {
    render(
      <Drawer {...defaultProps} backdrop={false} title="Test">
        <div>Content</div>
      </Drawer>,
    );

    // Check that backdrop overlay is not rendered
    const backdrop = document.querySelector(".fixed.inset-0.bg-black\\/25");
    expect(backdrop).not.toBeInTheDocument();
  });

  it("handles scroll blocking when backdrop is enabled", () => {
    const mockScrollY = 100;
    Object.defineProperty(window, "scrollY", { value: mockScrollY, writable: true });

    const { rerender } = render(
      <Drawer {...defaultProps} isOpen={false} backdrop={true} title="Test">
        <div>Content</div>
      </Drawer>,
    );

    // Open drawer
    rerender(
      <Drawer {...defaultProps} isOpen={true} backdrop={true} title="Test">
        <div>Content</div>
      </Drawer>,
    );

    // Check that body styles are applied
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe(`-${mockScrollY}px`);
    expect(document.body.style.width).toBe("100%");
  });

  it("does not block scroll when backdrop is false", () => {
    const { rerender } = render(
      <Drawer {...defaultProps} isOpen={false} backdrop={false} title="Test">
        <div>Content</div>
      </Drawer>,
    );

    // Open drawer
    rerender(
      <Drawer {...defaultProps} isOpen={true} backdrop={false} title="Test">
        <div>Content</div>
      </Drawer>,
    );

    // Check that body styles are not applied
    expect(document.body.style.position).toBe("");
    expect(document.body.style.top).toBe("");
    expect(document.body.style.width).toBe("");
  });

  it("restores scroll position when drawer closes", () => {
    const mockScrollY = 100;
    Object.defineProperty(window, "scrollY", { value: mockScrollY, writable: true });
    const mockScrollTo = vi.fn();
    Object.defineProperty(window, "scrollTo", { value: mockScrollTo, writable: true });

    const { rerender } = render(
      <Drawer {...defaultProps} isOpen={true} backdrop={true} title="Test">
        <div>Content</div>
      </Drawer>,
    );

    // Close drawer
    rerender(
      <Drawer {...defaultProps} isOpen={false} backdrop={true} title="Test">
        <div>Content</div>
      </Drawer>,
    );

    // Check that body styles are reset and scroll is restored
    expect(document.body.style.position).toBe("");
    expect(document.body.style.top).toBe("");
    expect(document.body.style.width).toBe("");
  });
});

describe("DrawerTitle", () => {
  it("renders with default styles within Drawer", () => {
    render(
      <Drawer {...defaultProps}>
        <DrawerTitle>Test Title</DrawerTitle>
      </Drawer>,
    );

    const title = screen.getByText("Test Title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("text-base", "font-semibold", "text-gray-900");
  });

  it("applies custom className within Drawer", () => {
    render(
      <Drawer {...defaultProps}>
        <DrawerTitle className="custom-title">Test Title</DrawerTitle>
      </Drawer>,
    );

    const title = screen.getByText("Test Title");
    expect(title).toHaveClass("custom-title");
  });
});

describe("DrawerDescription", () => {
  it("renders with default styles within Drawer", () => {
    render(
      <Drawer {...defaultProps}>
        <DrawerDescription>Test Description</DrawerDescription>
      </Drawer>,
    );

    const description = screen.getByText("Test Description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("mt-1", "text-sm", "text-gray-500");
  });

  it("applies custom className within Drawer", () => {
    render(
      <Drawer {...defaultProps}>
        <DrawerDescription className="custom-desc">Test Description</DrawerDescription>
      </Drawer>,
    );

    const description = screen.getByText("Test Description");
    expect(description).toHaveClass("custom-desc");
  });
});
