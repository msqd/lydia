import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Section } from "./Section";

describe("Section", () => {
  it("renders with default props", () => {
    render(<Section data-testid="section">Test content</Section>);

    const section = screen.getByTestId("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("mb-6");
    expect(section).toMatchSnapshot();
  });

  it("accepts additional className", () => {
    render(
      <Section className="test-class" data-testid="section">
        Test content
      </Section>,
    );

    const section = screen.getByTestId("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("mb-6");
    expect(section).toHaveClass("test-class");
    expect(section).toMatchSnapshot();
  });

  it("passes additional props to the section element", () => {
    const testId = "custom-section";
    render(
      <Section data-testid={testId} title="Test title">
        Test content
      </Section>,
    );

    const section = screen.getByTestId(testId);
    expect(section).toHaveAttribute("title", "Test title");
  });
});
