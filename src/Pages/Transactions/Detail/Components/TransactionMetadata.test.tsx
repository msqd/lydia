import { customRender, screen } from "@/Components/Utilities/Testing";
import { ToastProvider } from "@msqd/lydia/Components/Toast";
import type { DetailedTransaction } from "@msqd/lydia/Models/Transactions/types";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransactionMetadata } from "./TransactionMetadata";

// The toast provider is the real one, wrapped around each render below. Mocking
// @msqd/lydia/Components/Toast replaced a design-system component this file hands props to, and the
// stub could not have told us whether the copy action reaches a toast at all. See Testing.mdx, What to mock.

const mockTransaction: DetailedTransaction = {
  id: "tx001",
  url: "/api/users/123",
  method: "GET",
  status: "Successful",
  statusCode: 200,
  timestamp: "2024-03-20T10:30:00Z",
  responseTime: 120,
  client: "API Lab Client",
  apiName: "Users API",
  userAgent: "Mozilla/5.0",
  remoteAddress: "192.168.1.100",
  tags: { env: "production", version: "api-v2" },
  request: {
    headers: [{ name: "Content-Type", value: "application/json" }],
    body: {},
    contentType: "json",
    size: 100,
  },
  response: {
    headers: [{ name: "Content-Type", value: "application/json" }],
    body: {},
    contentType: "json",
    size: 200,
  },
};

describe("TransactionMetadata", () => {
  it("renders transaction summary in title", () => {
    customRender(
      <ToastProvider>
        <TransactionMetadata transaction={mockTransaction} />
      </ToastProvider>,
    );

    // Check for method badge
    expect(screen.getByText("GET")).toBeInTheDocument();

    // Check for URL path
    expect(screen.getByText("/api/users/123")).toBeInTheDocument();

    // Check for status code (may be split by badge component)
    expect(screen.getByTestId("status-badge-200")).toBeInTheDocument();

    // Check for response time
    expect(screen.getByText(/120ms/)).toBeInTheDocument();
  });

  it("renders expanded details when open", () => {
    customRender(
      <ToastProvider>
        <TransactionMetadata transaction={mockTransaction} defaultOpen={true} />
      </ToastProvider>,
    );

    // Check for full URL display (look for one with break-all class)
    expect(screen.getByText("/api/users/123", { selector: "span.break-all" })).toBeInTheDocument();

    // Check for client
    expect(screen.getByText("API Lab Client")).toBeInTheDocument();

    // Check for user agent
    expect(screen.getByText("Mozilla/5.0")).toBeInTheDocument();

    // Check for remote address
    expect(screen.getByText("192.168.1.100")).toBeInTheDocument();
  });

  it("displays tags when provided", () => {
    const tags = { env: "production", severity: "critical" };

    customRender(
      <ToastProvider>
        <TransactionMetadata transaction={mockTransaction} tags={tags} defaultOpen={true} />
      </ToastProvider>,
    );

    expect(screen.getByText("env=production")).toBeInTheDocument();
    expect(screen.getByText("severity=critical")).toBeInTheDocument();
  });

  it("renders a populated tags dict without throwing", () => {
    const tags = { "x-harp-team": "payments", "x-harp-env": "staging" };

    expect(() =>
      customRender(
        <ToastProvider>
          <TransactionMetadata transaction={mockTransaction} tags={tags} defaultOpen={true} />
        </ToastProvider>,
      ),
    ).not.toThrow();
    expect(screen.getByText("x-harp-team=payments")).toBeInTheDocument();
  });

  it("shows API name when present", () => {
    customRender(
      <ToastProvider>
        <TransactionMetadata transaction={mockTransaction} />
      </ToastProvider>,
    );

    expect(screen.getByText("Users API")).toBeInTheDocument();
  });

  it("handles copy to clipboard", () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    // Mock navigator.clipboard
    Object.defineProperty(global.navigator, "clipboard", {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
    });

    customRender(
      <ToastProvider>
        <TransactionMetadata transaction={mockTransaction} defaultOpen={true} />
      </ToastProvider>,
    );

    // Find the copy button by text content
    const copyButton = screen.getByText("Copy");
    fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith("GET /api/users/123");

    vi.restoreAllMocks();
  });

  it("calculates and displays TPDEX score correctly", () => {
    // Test satisfactory response time (<=100ms)
    const fastTransaction = { ...mockTransaction, responseTime: 50 };
    const { rerender } = customRender(
      <ToastProvider>
        <TransactionMetadata transaction={fastTransaction} />
      </ToastProvider>,
    );

    // Should show excellent TPDEX badge
    expect(screen.getByText("50ms")).toBeInTheDocument();

    // Test tolerable response time (100-500ms)
    const moderateTransaction = { ...mockTransaction, responseTime: 300 };
    rerender(
      <ToastProvider>
        <TransactionMetadata transaction={moderateTransaction} />
      </ToastProvider>,
    );
    expect(screen.getByText("300ms")).toBeInTheDocument();

    // Test frustrating response time (>500ms)
    const slowTransaction = { ...mockTransaction, responseTime: 1000 };
    rerender(
      <ToastProvider>
        <TransactionMetadata transaction={slowTransaction} />
      </ToastProvider>,
    );
    expect(screen.getByText("1000ms")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = customRender(
      <ToastProvider>
        <TransactionMetadata transaction={mockTransaction} className="custom-class" />
      </ToastProvider>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("TransactionMetadata with a hostile request target", () => {
  it.each(["//[x", "http://[::1", "//a b/", "/static/../../etc/passwd", "http://other-host/x?y=1"])(
    "renders %j as received",
    (url) => {
      const { container } = customRender(
        <ToastProvider>
          <TransactionMetadata transaction={{ ...mockTransaction, url }} />
        </ToastProvider>,
      );

      const shown = Array.from(container.querySelectorAll("[title]"))
        .filter((element) => element.getAttribute("title") === url)
        .map((element) => element.textContent)
        .join("");
      expect(shown).toBe(url);
    },
  );
});
