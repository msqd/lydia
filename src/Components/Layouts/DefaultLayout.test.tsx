import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DefaultLayout } from "./DefaultLayout";

// Mock ResizeObserver which is not available in the jsdom test environment
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// NavBar renders for real here. Mocking a design-system child makes a snapshot record this
// layout's skeleton against itself: #45 changed badge sizing on two pages and moved no snapshot,
// because the badges were mocked away. Mock only what this component hands no props to. See #56.

describe("DefaultLayout", () => {
  // Setup mock before each test
  beforeEach(() => {
    window.ResizeObserver = ResizeObserverMock;
  });

  it("renders the NavBar and content", () => {
    const { container } = render(
      <DefaultLayout>
        <div data-testid="content">Test Content</div>
      </DefaultLayout>,
    );

    const navbar = screen.getByTestId("navbar");
    const content = screen.getByTestId("content");

    expect(navbar).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Test Content");

    // One snapshot for this component, not one per test: the four other cases assert the class
    // they are about directly, and repeating a whole NavBar under each of them would guard the
    // same markup five times while making every NavBar change look like five regressions.
    expect(container).toMatchSnapshot();
  });

  it("passes navBarProps to NavBar component", () => {
    render(
      <DefaultLayout navBarProps={{ brand: "Custom Brand" }}>
        <div>Content</div>
      </DefaultLayout>,
    );

    const navbar = screen.getByTestId("navbar");
    expect(navbar).toHaveTextContent("Custom Brand");
  });

  it("applies custom classes to the content container", () => {
    render(
      <DefaultLayout contentClassName="custom-class">
        <div>Content</div>
      </DefaultLayout>,
    );

    const main = screen.getByRole("main");
    expect(main).toHaveClass("custom-class");
    expect(main).toHaveClass("flex-grow");
  });

  it("uses default content className if not provided", () => {
    render(
      <DefaultLayout>
        <div>Content</div>
      </DefaultLayout>,
    );

    const main = screen.getByRole("main");
    expect(main).toHaveClass("p-4");
    expect(main).toHaveClass("sm:p-6");
    expect(main).toHaveClass("lg:p-8");
  });

  it("passes complex NavBar props correctly", () => {
    const customLogo = <div data-testid="custom-logo">Custom Logo</div>;
    render(
      <DefaultLayout navBarProps={{ logo: customLogo, brand: "Test Brand" }}>
        <div>Content</div>
      </DefaultLayout>,
    );

    expect(screen.getByTestId("custom-logo")).toBeInTheDocument();
    expect(screen.getByText("Test Brand")).toBeInTheDocument();
  });

  /**
   * A page's own header: what the page is, and the instruments that act on it.
   * Inside `main`, so it is the page's and not a second banner beside the
   * NavBar's, and its title is the page's one `h1`.
   */
  describe("page header", () => {
    const page = () =>
      render(
        <DefaultLayout title="Recordings" toolbar={<button type="button">clear</button>}>
          <div data-testid="content">Test Content</div>
        </DefaultLayout>,
      );

    it("titles the page with its one level-one heading, inside main", () => {
      page();
      const main = screen.getByRole("main");

      expect(within(main).getByRole("heading", { level: 1, name: "Recordings" })).toBeInTheDocument();
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    });

    it("adds no landmark of its own", () => {
      const without = render(<DefaultLayout>x</DefaultLayout>);
      const landmarks = () =>
        ["banner", "navigation", "main", "contentinfo", "region"].map((role) => screen.queryAllByRole(role).length);
      const before = landmarks();
      without.unmount();

      page();
      expect(landmarks()).toEqual(before);
    });

    it("puts the toolbar beside the title, and the content after both", () => {
      page();
      const heading = screen.getByRole("heading", { level: 1 });
      const button = screen.getByRole("button", { name: "clear" });
      const content = screen.getByTestId("content");

      expect(heading.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(button.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("draws no header when there is no title", () => {
      render(<DefaultLayout>x</DefaultLayout>);
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });
});
