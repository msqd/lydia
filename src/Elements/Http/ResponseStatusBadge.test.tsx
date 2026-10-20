import { render, screen } from "@testing-library/react";
import * as httpStatusCodes from "http-status-codes";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResponseStatusBadge } from "./ResponseStatusBadge";

// A third-party lookup table, mocked so the test states the phrases it expects rather than
// depending on the package's wording. See #56.
vi.mock("http-status-codes", async () => {
  const actual = await vi.importActual("http-status-codes");
  return {
    ...actual,
    getReasonPhrase: vi.fn(),
  };
});

describe("ResponseStatusBadge", () => {
  beforeEach(() => {
    vi.mocked(httpStatusCodes.getReasonPhrase).mockImplementation((code) => {
      switch (code) {
        case 200:
          return "OK";
        case 201:
          return "Created";
        case 301:
          return "Moved Permanently";
        case 404:
          return "Not Found";
        case 500:
          return "Internal Server Error";
        default:
          throw new Error("Invalid status code");
      }
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders 2xx status codes as a success", () => {
    render(<ResponseStatusBadge statusCode={200} />);
    const badge = screen.getByText("200 OK");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-success-50", "text-success-700", "ring-success-600/20");

    // Test another 2xx code
    const { rerender } = render(<></>);
    rerender(<ResponseStatusBadge statusCode={201} />);
    const createdBadge = screen.getByText("201 Created");
    expect(createdBadge).toHaveClass("bg-success-50", "text-success-700", "ring-success-600/20");
  });

  it("renders 3xx status codes with blue color", () => {
    render(<ResponseStatusBadge statusCode={301} />);
    const badge = screen.getByText("301 Moved Permanently");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-blue-50", "text-blue-700", "ring-blue-600/20");
  });

  it("renders 4xx status codes as a warning", () => {
    render(<ResponseStatusBadge statusCode={404} />);
    const badge = screen.getByText("404 Not Found");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-warning-50", "text-warning-700", "ring-warning-600/20");
  });

  it("renders 5xx status codes as a danger", () => {
    render(<ResponseStatusBadge statusCode={500} />);
    const badge = screen.getByText("500 Internal Server Error");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-danger-50", "text-danger-700", "ring-danger-600/20");
  });

  it("renders 6xx status codes with purple color", () => {
    vi.mocked(httpStatusCodes.getReasonPhrase).mockImplementation(() => "Custom Extension");

    render(<ResponseStatusBadge statusCode={600} />);
    const badge = screen.getByText("600 Custom Extension");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-purple-50", "text-purple-700", "ring-purple-600/20");
  });

  describe("without the reason phrase", () => {
    it("renders the code alone", () => {
      render(<ResponseStatusBadge statusCode={500} showReason={false} />);

      expect(screen.getByText("500")).toBeInTheDocument();
      expect(screen.queryByText(/Internal Server Error/)).not.toBeInTheDocument();
    });

    it("still says the class in colour, which is the half that does not repeat", () => {
      render(<ResponseStatusBadge statusCode={500} showReason={false} />);

      expect(screen.getByText("500")).toHaveClass("bg-danger-50", "text-danger-700", "ring-danger-600/20");
    });

    // A lookup whose answer is thrown away is one an unknown code can still
    // throw from, and the `catch` would then be handling a phrase nobody asked
    // for.
    it("does not look up a phrase it will not render", () => {
      render(<ResponseStatusBadge statusCode={500} showReason={false} />);

      expect(httpStatusCodes.getReasonPhrase).not.toHaveBeenCalled();
    });

    it("keeps the test id, so a consumer's queries do not change with the variant", () => {
      render(<ResponseStatusBadge statusCode={404} showReason={false} />);

      expect(screen.getByTestId("status-badge-404")).toBeInTheDocument();
    });
  });

  // The default is what every existing consumer already renders, asserted so
  // that adding the option cannot quietly change it.
  it("renders the reason phrase unless asked not to", () => {
    render(<ResponseStatusBadge statusCode={404} />);

    expect(screen.getByText("404 Not Found")).toBeInTheDocument();
  });

  it("handles unknown status codes gracefully", () => {
    vi.mocked(httpStatusCodes.getReasonPhrase).mockImplementation(() => {
      throw new Error("Invalid status code");
    });

    render(<ResponseStatusBadge statusCode={999} />);
    const badge = screen.getByText("999 Unknown");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-purple-50", "text-purple-700", "ring-purple-600/20");
  });
});
