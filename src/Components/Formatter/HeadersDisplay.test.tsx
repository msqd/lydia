import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeadersDisplay } from "./HeadersDisplay";

describe("HeadersDisplay", () => {
  it("renders headers as key-value pairs", () => {
    const headers = [
      { name: "Content-Type", value: "application/json" },
      { name: "Authorization", value: "Bearer token123" },
      { name: "User-Agent", value: "TestAgent/1.0" },
    ];

    render(<HeadersDisplay headers={headers} />);

    expect(screen.getByText("Content-Type:")).toBeInTheDocument();
    expect(screen.getByText("application/json")).toBeInTheDocument();
    expect(screen.getByText("Authorization:")).toBeInTheDocument();
    expect(screen.getByText("Bearer token123")).toBeInTheDocument();
    expect(screen.getByText("User-Agent:")).toBeInTheDocument();
    expect(screen.getByText("TestAgent/1.0")).toBeInTheDocument();
  });

  it("renders a repeated header once per occurrence", () => {
    const headers = [
      { name: "set-cookie", value: "session=abc; Path=/; HttpOnly" },
      { name: "set-cookie", value: "theme=dark; Path=/" },
      { name: "set-cookie", value: "tracking=xyz; Path=/; Secure" },
    ];

    render(<HeadersDisplay headers={headers} />);

    expect(screen.getAllByText("set-cookie:")).toHaveLength(3);
    expect(screen.getByText("session=abc; Path=/; HttpOnly")).toBeInTheDocument();
    expect(screen.getByText("theme=dark; Path=/")).toBeInTheDocument();
    expect(screen.getByText("tracking=xyz; Path=/; Secure")).toBeInTheDocument();
  });

  it("treats names differing only in case as separate headers", () => {
    const headers = [
      { name: "Set-Cookie", value: "first=1" },
      { name: "set-cookie", value: "second=2" },
    ];

    const { container } = render(<HeadersDisplay headers={headers} />);

    expect(screen.getByText("Set-Cookie:")).toBeInTheDocument();
    expect(screen.getByText("set-cookie:")).toBeInTheDocument();
    expect(container.firstChild?.childNodes).toHaveLength(2);
  });

  it("preserves the order supplied rather than sorting", () => {
    const headers = [
      { name: "zeta", value: "1" },
      { name: "alpha", value: "2" },
      { name: "middle", value: "3" },
    ];

    const { container } = render(<HeadersDisplay headers={headers} />);

    const renderedNames = Array.from(container.querySelectorAll("span:first-child")).map((span) => span.textContent);
    expect(renderedNames).toEqual(["zeta:", "alpha:", "middle:"]);
  });

  it("renders empty state when no headers", () => {
    render(<HeadersDisplay headers={[]} />);
    expect(screen.getByText("No headers")).toBeInTheDocument();
  });

  it("supports custom className", () => {
    const { container } = render(
      <HeadersDisplay headers={[{ name: "Content-Type", value: "application/json" }]} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("passes through additional props", () => {
    render(
      <HeadersDisplay headers={[{ name: "Content-Type", value: "application/json" }]} data-testid="headers-display" />,
    );
    expect(screen.getByTestId("headers-display")).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const headers = [
      { name: "Content-Type", value: "application/json" },
      { name: "Authorization", value: "Bearer token123" },
    ];

    const { container } = render(<HeadersDisplay headers={headers} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot with repeated headers", () => {
    const headers = [
      { name: "set-cookie", value: "session=abc" },
      { name: "set-cookie", value: "theme=dark" },
    ];

    const { container } = render(<HeadersDisplay headers={headers} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot with empty headers", () => {
    const { container } = render(<HeadersDisplay headers={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
