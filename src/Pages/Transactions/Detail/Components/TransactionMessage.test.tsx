import type { HttpMessage } from "@msqd/lydia/Models/Transactions/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TransactionMessage } from "./TransactionMessage";

const message: HttpMessage = {
  headers: [
    { name: "Content-Type", value: "application/json" },
    { name: "Set-Cookie", value: "session=b7f3a1c9; Path=/; HttpOnly" },
    { name: "set-cookie", value: "csrf=9d2e4f81; Path=/; Secure" },
    { name: "set-cookie", value: "locale=en-GB; Path=/" },
  ],
  contentType: "json",
};

describe("TransactionMessage", () => {
  it("renders every occurrence of a repeated header", () => {
    render(<TransactionMessage title="Response" message={message} defaultOpen={true} />);

    expect(screen.getByText("session=b7f3a1c9; Path=/; HttpOnly")).toBeInTheDocument();
    expect(screen.getByText("csrf=9d2e4f81; Path=/; Secure")).toBeInTheDocument();
    expect(screen.getByText("locale=en-GB; Path=/")).toBeInTheDocument();
  });

  it("keeps names that differ only in case as separate rows", () => {
    render(<TransactionMessage title="Response" message={message} defaultOpen={true} />);

    expect(screen.getByText("Set-Cookie:")).toBeInTheDocument();
    expect(screen.getAllByText("set-cookie:")).toHaveLength(2);
  });

  it("renders headers in the order they arrived", () => {
    const { container } = render(<TransactionMessage title="Response" message={message} defaultOpen={true} />);

    const names = Array.from(container.querySelectorAll(".font-mono span:first-child")).map((span) => span.textContent);
    expect(names).toEqual(["Content-Type:", "Set-Cookie:", "set-cookie:", "set-cookie:"]);
  });
});
