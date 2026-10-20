import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { P } from "./Paragraphs";

describe("P (Paragraph)", () => {
  it("renders with default props", () => {
    render(<P data-testid="paragraph">Test content</P>);

    const paragraph = screen.getByTestId("paragraph");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveClass("mb-2");
    expect(paragraph).toHaveClass("text-base");
    expect(paragraph).toHaveClass("text-gray-700");
    expect(paragraph).toMatchSnapshot();
  });

  it("accepts additional className", () => {
    render(
      <P className="test-class" data-testid="paragraph">
        Test content
      </P>,
    );

    const paragraph = screen.getByTestId("paragraph");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveClass("mb-2");
    expect(paragraph).toHaveClass("text-base");
    expect(paragraph).toHaveClass("text-gray-700");
    expect(paragraph).toHaveClass("test-class");
    expect(paragraph).toMatchSnapshot();
  });

  it("passes additional props to the p element", () => {
    const testId = "custom-paragraph";
    render(
      <P data-testid={testId} title="Test title">
        Test content
      </P>,
    );

    const paragraph = screen.getByTestId(testId);
    expect(paragraph).toHaveAttribute("title", "Test title");
  });
});
