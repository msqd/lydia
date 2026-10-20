import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Toast } from "./Toast";

// Headless UI's Transition is mocked so a closing toast is gone at once rather than after an
// animation frame jsdom never runs. Third-party behaviour, not this component's rendering. See #56.
vi.mock("@headlessui/react", () => ({
  Transition: ({ show, children, afterLeave }: any) => {
    if (afterLeave && !show) {
      // Immediately call afterLeave when show is false (simulating end of animation)
      afterLeave();
    }
    return show ? children : null;
  },
}));

describe("Toast Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders successfully with required props", () => {
    render(<Toast id="test-toast-1" type="success" title="Test Toast" show={true} onClose={mockOnClose} />);

    expect(screen.getByText("Test Toast")).toBeInTheDocument();
  });

  it("renders with message when provided", () => {
    render(
      <Toast
        id="test-toast-1"
        type="success"
        title="Test Toast"
        message="This is a test message"
        show={true}
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText("Test Toast")).toBeInTheDocument();
    expect(screen.getByText("This is a test message")).toBeInTheDocument();
  });

  it("applies correct CSS class based on type", () => {
    const { rerender } = render(
      <Toast id="test-toast-1" type="success" title="Success Toast" show={true} onClose={mockOnClose} />,
    );

    expect(screen.getByRole("alert")).toHaveClass("bg-success-50");

    rerender(<Toast id="test-toast-1" type="error" title="Error Toast" show={true} onClose={mockOnClose} />);

    expect(screen.getByRole("alert")).toHaveClass("bg-danger-50");

    rerender(<Toast id="test-toast-1" type="warning" title="Warning Toast" show={true} onClose={mockOnClose} />);

    expect(screen.getByRole("alert")).toHaveClass("bg-warning-50");

    rerender(<Toast id="test-toast-1" type="info" title="Info Toast" show={true} onClose={mockOnClose} />);

    expect(screen.getByRole("alert")).toHaveClass("bg-blue-50");
  });

  it("closes when the close button is clicked", async () => {
    render(<Toast id="test-toast-1" type="success" title="Test Toast" show={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: /close notification/i });

    // When we click the close button, it should set isShowing to false, which
    // makes the Transition's show prop false, triggering afterLeave
    act(() => {
      fireEvent.click(closeButton);
    });

    // Our mocked Transition component calls afterLeave immediately when show is false
    expect(mockOnClose).toHaveBeenCalledWith("test-toast-1");
  });

  it("auto-closes after duration", () => {
    render(
      <Toast id="test-toast-1" type="success" title="Test Toast" show={true} duration={3000} onClose={mockOnClose} />,
    );

    // Toast hasn't auto-closed yet
    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward time to trigger auto-close
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // onClose should have been called when the animation completes
    expect(mockOnClose).toHaveBeenCalledWith("test-toast-1");
  });

  it("does not show when show is false", () => {
    const { container } = render(
      <Toast id="test-toast-1" type="success" title="Test Toast" show={false} onClose={mockOnClose} />,
    );

    // Since our mocked Transition returns null when show is false
    expect(container.innerHTML).toBe("");
  });

  it("accepts and applies custom className", () => {
    render(
      <Toast
        id="test-toast-1"
        type="success"
        title="Test Toast"
        show={true}
        onClose={mockOnClose}
        className="custom-test-class"
      />,
    );

    expect(screen.getByRole("alert")).toHaveClass("custom-test-class");
  });
});
