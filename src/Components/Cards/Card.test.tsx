import { describe, expect, it } from "vitest";
import { customRender, expectComponentDefaults, screen } from "../Utilities/Testing";
import { Card } from "./Card";

describe("Card", () => {
  it("renders with default props", () => {
    const { container } = customRender(<Card data-testid="card">Content</Card>);

    const card = screen.getByTestId("card");
    expectComponentDefaults({
      element: card,
      defaultClasses: ["bg-white", "overflow-hidden", "sm:rounded-sm", "ring-1", "ring-gray-200"],
      tagName: "DIV",
    });

    // Check classes on the inner div
    const contentDiv = card.firstChild as HTMLElement;
    expect(contentDiv).toHaveClass("px-4", "py-5", "sm:p-6");

    expect(container).toMatchSnapshot();
  });

  it("renders without padding", () => {
    const { container } = customRender(
      <Card hasDefaultPadding={false} data-testid="card">
        Content
      </Card>,
    );

    const card = screen.getByTestId("card");
    expectComponentDefaults({
      element: card,
      defaultClasses: ["bg-white", "overflow-hidden", "sm:rounded-sm", "ring-1", "ring-gray-200"],
      tagName: "DIV",
    });

    // Check classes on the inner div
    const contentDiv = card.firstChild as HTMLElement;
    expect(contentDiv).not.toHaveClass("px-4");
    expect(contentDiv).not.toHaveClass("py-5");
    expect(contentDiv).not.toHaveClass("sm:p-6");

    expect(container).toMatchSnapshot("Card-without-padding");
  });

  it("renders without shadow and rounding", () => {
    const { container } = customRender(
      <Card hasDefaultShadowAndRounding={false} data-testid="card">
        Content
      </Card>,
    );

    const card = screen.getByTestId("card");

    expect(card).toHaveClass("bg-white", "ring-1", "ring-gray-200");
    expect(card).not.toHaveClass("sm:rounded-sm");

    // Check classes on the inner div
    const contentDiv = card.firstChild as HTMLElement;
    expect(contentDiv).toHaveClass("px-4", "py-5", "sm:p-6");

    expect(container).toMatchSnapshot("Card-without-rounding");
  });

  it("accepts additional className for the outer div", () => {
    const { container } = customRender(
      <Card className="test-outer-class" data-testid="card">
        Content
      </Card>,
    );

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("test-outer-class");
    expect(container).toMatchSnapshot("Card-with-custom-class");
  });

  it("accepts additional contentClassName for the inner div", () => {
    const { container } = customRender(
      <Card contentClassName="test-inner-class" data-testid="card">
        Content
      </Card>,
    );

    const card = screen.getByTestId("card");
    const contentDiv = card.firstChild as HTMLElement;
    expect(contentDiv).toHaveClass("test-inner-class");

    expect(container).toMatchSnapshot("Card-with-content-class");
  });

  it("renders with a header", () => {
    const { container } = customRender(
      <Card header="Header Text" data-testid="card">
        Content
      </Card>,
    );

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("divide-y", "divide-gray-200");

    const headerDiv = card.firstChild as HTMLElement;
    expect(headerDiv).toHaveTextContent("Header Text");
    expect(headerDiv).toHaveClass("px-4", "py-5", "sm:px-6");

    const contentDiv = card.childNodes[1] as HTMLElement;
    expect(contentDiv).toHaveTextContent("Content");

    expect(container).toMatchSnapshot("Card-with-header");
  });

  it("renders with a footer", () => {
    const { container } = customRender(
      <Card footer="Footer Text" data-testid="card">
        Content
      </Card>,
    );

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("divide-y", "divide-gray-200");

    const contentDiv = card.firstChild as HTMLElement;
    expect(contentDiv).toHaveTextContent("Content");

    const footerDiv = card.childNodes[1] as HTMLElement;
    expect(footerDiv).toHaveTextContent("Footer Text");
    expect(footerDiv).toHaveClass("px-4", "py-4", "sm:px-6");

    expect(container).toMatchSnapshot("Card-with-footer");
  });

  it("renders with both header and footer", () => {
    const { container } = customRender(
      <Card header="Header Text" footer="Footer Text" data-testid="card">
        Content
      </Card>,
    );

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("divide-y", "divide-gray-200");

    const headerDiv = card.firstChild as HTMLElement;
    expect(headerDiv).toHaveTextContent("Header Text");

    const contentDiv = card.childNodes[1] as HTMLElement;
    expect(contentDiv).toHaveTextContent("Content");

    const footerDiv = card.childNodes[2] as HTMLElement;
    expect(footerDiv).toHaveTextContent("Footer Text");

    expect(container).toMatchSnapshot("Card-with-header-and-footer");
  });

  it("accepts additional headerClassName and footerClassName", () => {
    const { container } = customRender(
      <Card
        header="Header Text"
        headerClassName="test-header-class"
        footer="Footer Text"
        footerClassName="test-footer-class"
        data-testid="card"
      >
        Content
      </Card>,
    );

    const card = screen.getByTestId("card");

    const headerDiv = card.firstChild as HTMLElement;
    expect(headerDiv).toHaveClass("test-header-class");

    const footerDiv = card.childNodes[2] as HTMLElement;
    expect(footerDiv).toHaveClass("test-footer-class");

    expect(container).toMatchSnapshot("Card-with-custom-classes");
  });
});
