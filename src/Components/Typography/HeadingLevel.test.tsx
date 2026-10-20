import { Foldable } from "@msqd/lydia/Components/Utilities/Foldable";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeadingLevel, Subheading } from "./HeadingLevel";

/**
 * A heading one level below the section it sits in, wherever that is. A
 * component dropped into a page cannot know the page's outline; the section
 * around it does, and says so once (axe `heading-order`, WCAG 1.3.1).
 */
describe("HeadingLevel", () => {
  it("draws a subheading one level below the section", () => {
    render(
      <HeadingLevel level={2}>
        <Subheading>Headers</Subheading>
      </HeadingLevel>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Headers" })).toBeInTheDocument();
  });

  it("falls back to the level it is given outside any section", () => {
    render(<Subheading fallback={4}>Headers</Subheading>);
    expect(screen.getByRole("heading", { level: 4, name: "Headers" })).toBeInTheDocument();
  });

  it("titles a Foldable one level below its section, and what it holds one below that", () => {
    render(
      <HeadingLevel level={3}>
        <Foldable title="Method">
          <Subheading>GET</Subheading>
        </Foldable>
      </HeadingLevel>,
    );
    expect(screen.getByRole("heading", { level: 4, name: "Method" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 5, name: "GET" })).toBeInTheDocument();
  });

  it("lets a Foldable's own headingLevel win", () => {
    render(
      <HeadingLevel level={3}>
        <Foldable title="Method" headingLevel={2} />
      </HeadingLevel>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Method" })).toBeInTheDocument();
  });

  it("never goes below h6", () => {
    render(
      <HeadingLevel level={6}>
        <Subheading>Deep</Subheading>
      </HeadingLevel>,
    );
    expect(screen.getByRole("heading", { level: 6, name: "Deep" })).toBeInTheDocument();
  });
});
