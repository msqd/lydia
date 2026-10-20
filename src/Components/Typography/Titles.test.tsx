import { describe, expect, it } from "vitest";
import { customRender, expectComponentDefaults, screen, testClassNameMerging } from "../Utilities/Testing";
import { H1, H2, H3, H4, H5, H6 } from "./Titles";

describe("Heading components", () => {
  describe("H1", () => {
    it("renders with default props", () => {
      const { container } = customRender(<H1 data-testid="h1">Test heading</H1>);

      const heading = screen.getByTestId("h1");
      expectComponentDefaults({
        element: heading,
        tagName: "h1",
        defaultClasses: ["pb-6", "text-2xl", "font-semibold", "text-gray-900"],
      });
      expect(container).toMatchSnapshot();
    });

    it("accepts additional className", () => {
      testClassNameMerging({
        Component: (props) => (
          <H1 data-testid="h1" {...props}>
            Test heading
          </H1>
        ),
        customClass: "test-class",
        defaultClasses: ["pb-6", "text-2xl", "font-semibold", "text-gray-900"],
        getElement: () => screen.getByTestId("h1"),
      });
    });
  });

  describe("H2", () => {
    it("renders with default props", () => {
      const { container } = customRender(<H2 data-testid="h2">Test heading</H2>);

      const heading = screen.getByTestId("h2");
      expectComponentDefaults({
        element: heading,
        tagName: "h2",
        defaultClasses: ["pb-4", "text-xl", "font-semibold", "text-gray-900"],
      });
      expect(container).toMatchSnapshot();
    });
  });

  describe("H3", () => {
    it("renders with default props", () => {
      const { container } = customRender(<H3 data-testid="h3">Test heading</H3>);

      const heading = screen.getByTestId("h3");
      expectComponentDefaults({
        element: heading,
        tagName: "h3",
        defaultClasses: ["pb-4", "text-lg", "font-semibold", "text-gray-900"],
      });
      expect(container).toMatchSnapshot();
    });
  });

  describe("H4", () => {
    it("renders with default props", () => {
      const { container } = customRender(<H4 data-testid="h4">Test heading</H4>);

      const heading = screen.getByTestId("h4");
      expectComponentDefaults({
        element: heading,
        tagName: "h4",
        defaultClasses: ["pb-4", "text-base", "font-semibold", "text-gray-900"],
      });
      expect(container).toMatchSnapshot();
    });
  });

  describe("H5", () => {
    it("renders with default props", () => {
      const { container } = customRender(<H5 data-testid="h5">Test heading</H5>);

      const heading = screen.getByTestId("h5");
      expectComponentDefaults({
        element: heading,
        tagName: "h5",
        defaultClasses: ["pb-4", "text-sm", "font-semibold", "text-gray-900"],
      });
      expect(container).toMatchSnapshot();
    });

    it("renders with custom padding", () => {
      const { container } = customRender(
        <H5 padding="py-2" data-testid="h5">
          Test heading
        </H5>,
      );

      const heading = screen.getByTestId("h5");
      expectComponentDefaults({
        element: heading,
        tagName: "h5",
        defaultClasses: ["py-2", "text-sm", "font-semibold", "text-gray-900"],
      });
      expect(heading).not.toHaveClass("pb-4");
      expect(container).toMatchSnapshot();
    });
  });

  describe("H6", () => {
    it("renders with default props", () => {
      const { container } = customRender(<H6 data-testid="h6">Test heading</H6>);

      const heading = screen.getByTestId("h6");
      expectComponentDefaults({
        element: heading,
        tagName: "h6",
        defaultClasses: ["pb-4", "text-xs", "font-semibold", "text-gray-900"],
      });
      expect(container).toMatchSnapshot();
    });
  });

  // A heading's *level* says where it sits in the document outline; its size
  // says how it looks. A component nested inside a page it does not own has to
  // move the first without moving the second -- otherwise it must choose
  // between being the right size and being in the right place, and whichever
  // it gives up, either a screen reader or a designer pays for it.
  describe("H5 at another level", () => {
    it("is an h5 unless told otherwise", () => {
      customRender(<H5>Facets</H5>);

      expect(screen.getByRole("heading", { level: 5, name: "Facets" })).toBeInTheDocument();
    });

    it("renders the level it was given", () => {
      customRender(<H5 level={3}>Facets</H5>);

      expect(screen.getByRole("heading", { level: 3, name: "Facets" })).toBeInTheDocument();
    });

    it("keeps its own size at any level", () => {
      customRender(
        <H5 level={2} data-testid="h">
          Facets
        </H5>,
      );

      expect(screen.getByTestId("h")).toHaveClass("text-sm");
    });
  });
});
