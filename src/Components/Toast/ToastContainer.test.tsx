import { render, screen } from "@testing-library/react";
import { ToastContainer } from "./ToastContainer";

describe("ToastContainer", () => {
  it("renders with the correct default position", () => {
    render(<ToastContainer />);
    const container = screen.getByTestId("toast-container");
    expect(container).toHaveClass("top-0 right-0");
  });

  it("renders with custom position", () => {
    render(<ToastContainer position="bottom-left" />);
    const container = screen.getByTestId("toast-container");
    expect(container).toHaveClass("bottom-0 left-0");
  });

  it("renders children properly", () => {
    render(
      <ToastContainer>
        <div data-testid="toast-child">Test Child</div>
      </ToastContainer>,
    );

    expect(screen.getByTestId("toast-child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<ToastContainer className="custom-class" />);
    const container = screen.getByTestId("toast-container");
    expect(container).toHaveClass("custom-class");
  });

  // Test all position options
  const positions = [
    { position: "top-right", className: "top-0 right-0" },
    { position: "top-left", className: "top-0 left-0" },
    { position: "bottom-right", className: "bottom-0 right-0" },
    { position: "bottom-left", className: "bottom-0 left-0" },
    { position: "top-center", className: "top-0 left-1/2 -translate-x-1/2" },
    { position: "bottom-center", className: "bottom-0 left-1/2 -translate-x-1/2" },
  ];

  positions.forEach(({ position, className }) => {
    it(`applies correct styles for ${position} position`, () => {
      render(<ToastContainer position={position as any} />);

      const container = screen.getByTestId("toast-container");
      expect(container).toHaveClass(className);
    });
  });
});
