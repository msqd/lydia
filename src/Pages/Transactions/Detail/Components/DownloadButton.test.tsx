import { customRender, screen } from "@/Components/Utilities/Testing";
import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadButton } from "./DownloadButton";

describe("DownloadButton", () => {
  // Mock anchor click to prevent jsdom navigation warning
  const originalCreateElement = document.createElement.bind(document);
  beforeEach(() => {
    document.createElement = vi.fn((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        element.click = vi.fn();
      }
      return element;
    }) as typeof document.createElement;
  });
  afterEach(() => {
    document.createElement = originalCreateElement;
  });

  it("renders with default props", () => {
    customRender(<DownloadButton data="test data" filename="test.txt" />);

    expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument();
    expect(screen.getByRole("button").querySelector("svg")).toBeInTheDocument(); // Icon
  });

  it("renders without icon when showIcon is false", () => {
    customRender(<DownloadButton data="test data" filename="test.txt" showIcon={false} />);

    expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument();
    expect(screen.getByRole("button").querySelector("svg")).not.toBeInTheDocument();
  });

  it("renders with custom children", () => {
    customRender(
      <DownloadButton data="test data" filename="test.txt">
        Export PDF
      </DownloadButton>,
    );

    expect(screen.getByRole("button", { name: /export pdf/i })).toBeInTheDocument();
  });

  it("handles download click", () => {
    // Mock URL methods
    const createObjectURLSpy = vi.fn(() => "blob:mock-url");
    const revokeObjectURLSpy = vi.fn();
    global.URL.createObjectURL = createObjectURLSpy;
    global.URL.revokeObjectURL = revokeObjectURLSpy;

    customRender(<DownloadButton data="Hello, World!" filename="hello.txt" mimeType="text/plain" />);

    fireEvent.click(screen.getByRole("button"));

    // Verify blob was created for download
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");

    vi.restoreAllMocks();
  });

  it("handles JSON data from objects", () => {
    const createObjectURLSpy = vi.fn(() => "blob:mock-url");
    global.URL.createObjectURL = createObjectURLSpy;

    const testData = { message: "Hello", value: 42 };

    customRender(<DownloadButton data={testData} filename="data.json" />);

    fireEvent.click(screen.getByRole("button"));

    expect(createObjectURLSpy).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it("calls onDownload callback when provided", () => {
    const onDownload = vi.fn();

    customRender(<DownloadButton data="test" filename="test.txt" onDownload={onDownload} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onDownload).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    customRender(<DownloadButton data="test" filename="test.txt" className="custom-class" />);

    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("passes through button props", () => {
    customRender(<DownloadButton data="test" filename="test.txt" variant="secondary" size="lg" disabled />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("bg-white"); // secondary variant
  });
});
