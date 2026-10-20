import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Foldable } from "./Foldable";

describe("Foldable", () => {
  it("renders with title", () => {
    render(<Foldable title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with title and subtitle", () => {
    render(<Foldable title="Test Title" subtitle="Test subtitle content" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test subtitle content")).toBeInTheDocument();
  });

  it("renders content when expanded by default", () => {
    render(
      <Foldable title="Test Title" defaultOpen={true}>
        <div>Test content</div>
      </Foldable>,
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("hides content when collapsed by default", () => {
    render(
      <Foldable title="Test Title" defaultOpen={false}>
        <div>Test content</div>
      </Foldable>,
    );
    expect(screen.queryByText("Test content")).not.toBeInTheDocument();
  });

  it("toggles content visibility when clicked", async () => {
    const user = userEvent.setup();
    render(
      <Foldable title="Test Title" defaultOpen={true}>
        <div>Test content</div>
      </Foldable>,
    );

    const button = screen.getByRole("button");
    expect(screen.getByText("Test content")).toBeInTheDocument();

    // Click to collapse
    await user.click(button);
    expect(screen.queryByText("Test content")).not.toBeInTheDocument();

    // Click to expand
    await user.click(button);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("shows chevron down when collapsed", () => {
    const { container } = render(
      <Foldable title="Test Title" defaultOpen={false}>
        <div>Test content</div>
      </Foldable>,
    );
    // Check for ChevronDown icon by looking for its specific path
    const chevronDownPath = container.querySelector('path[d="m19.5 8.25-7.5 7.5-7.5-7.5"]');
    expect(chevronDownPath).toBeInTheDocument();
  });

  it("shows chevron up when expanded", () => {
    const { container } = render(
      <Foldable title="Test Title" defaultOpen={true}>
        <div>Test content</div>
      </Foldable>,
    );
    // Check for ChevronUp icon by looking for its specific path
    const chevronUpPath = container.querySelector('path[d="m4.5 15.75 7.5-7.5 7.5 7.5"]');
    expect(chevronUpPath).toBeInTheDocument();
  });

  it("does not show chevron when no children", () => {
    render(<Foldable title="Test Title" />);
    expect(screen.queryByTestId("ChevronDownIcon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ChevronUpIcon")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Foldable title="Test Title" className="custom-class" data-testid="foldable-container" />);
    const container = screen.getByTestId("foldable-container");
    expect(container).toHaveClass("custom-class");
  });

  it("passes through additional props", () => {
    render(<Foldable title="Test Title" data-testid="foldable-container" role="region" />);
    const container = screen.getByTestId("foldable-container");
    expect(container).toHaveAttribute("role", "region");
  });

  it("matches snapshot with default state", () => {
    const { container } = render(
      <Foldable title="Test Title">
        <div>Test content</div>
      </Foldable>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot with subtitle", () => {
    const { container } = render(
      <Foldable title="Test Title" subtitle="Test subtitle">
        <div>Test content</div>
      </Foldable>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  // After the snapshots on purpose: they record headlessui's generated ids,
  // which are numbered per render, so a test inserted above them renumbers
  // every id and rewrites the snapshots for no reason of its own.
  //
  // The rail a Foldable sits in has its own heading, and only the consumer
  // knows what it is. Fixed at h5, a rail headed h2 produces h2 then h5 -- two
  // levels skipped, which axe reports as `heading-order` and WCAG 1.3.1 calls
  // a failure. There was nothing to pass to fix it.
  it("heads its title h5 unless told otherwise", () => {
    render(<Foldable title="Method" />);

    expect(screen.getByRole("heading", { level: 5, name: "Method" })).toBeInTheDocument();
  });

  it("heads its title at the level it was given", () => {
    render(<Foldable title="Method" headingLevel={3} />);

    expect(screen.getByRole("heading", { level: 3, name: "Method" })).toBeInTheDocument();
  });

  /**
   * The disclosure button holds nothing else interactive. A reset link drawn
   * inside it was a link nested in a button: a screen reader announces one
   * control and a keyboard reaches two, WCAG 4.1.2, axe `nested-interactive`.
   */
  describe("a title action", () => {
    const withAction = (onAction = () => {}) =>
      render(
        <Foldable
          title="Method"
          titleAction={
            <a
              href="#reset"
              onClick={(event) => {
                event.preventDefault();
                onAction();
              }}
            >
              reset
            </a>
          }
        >
          <p>GET</p>
        </Foldable>,
      );

    it("is not inside the disclosure button", () => {
      withAction();
      const button = screen.getByRole("button", { name: "Method" });

      expect(screen.getByRole("link", { name: "reset" }).closest("button")).toBeNull();
      expect(button.querySelectorAll("a, button, input, select, textarea, [tabindex]")).toHaveLength(0);
    });

    it("leaves the heading named by the title alone", () => {
      withAction();
      expect(screen.getByRole("heading", { level: 5 })).toHaveAccessibleName("Method");
    });

    it("acts without folding the section", async () => {
      const user = userEvent.setup();
      let acted = 0;
      withAction(() => {
        acted += 1;
      });

      await user.click(screen.getByRole("link", { name: "reset" }));
      expect(acted).toBe(1);
      expect(screen.getByText("GET")).toBeVisible();
      expect(screen.getByRole("button", { name: "Method" })).toHaveAttribute("aria-expanded", "true");
    });

    it("comes after the disclosure button in the tab order", async () => {
      const user = userEvent.setup();
      withAction();

      await user.tab();
      expect(screen.getByRole("button", { name: "Method" })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("link", { name: "reset" })).toHaveFocus();
    });
  });

  /**
   * The button inside the heading, as the WAI disclosure pattern draws it, and
   * not the other way round: a button's content is phrasing content, so a
   * heading inside one is invalid HTML.
   */
  it("puts its disclosure button inside its heading", () => {
    render(
      <Foldable title="Method">
        <p>GET</p>
      </Foldable>,
    );
    expect(screen.getByRole("button", { name: "Method" }).closest("h5")).not.toBeNull();
  });
});
