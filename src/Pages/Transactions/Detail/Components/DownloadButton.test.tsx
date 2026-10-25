import { customRender, screen } from "@/Components/Utilities/Testing";
import { fireEvent } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadButton } from "./DownloadButton";

// jsdom's Blob has no arrayBuffer()
const readBytes = (blob: Blob) =>
  new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });

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

  describe("download", () => {
    const createObjectURL = vi.fn((_blob: Blob) => "blob:mock-url");
    const revokeObjectURL = vi.fn();

    beforeEach(() => {
      global.URL.createObjectURL = createObjectURL;
      global.URL.revokeObjectURL = revokeObjectURL;
    });
    afterEach(() => {
      vi.useRealTimers();
      createObjectURL.mockClear();
      revokeObjectURL.mockClear();
    });

    /** Click the button and return the blob that was offered for download. */
    const download = async (data: ComponentProps<typeof DownloadButton>["data"], mimeType?: string) => {
      customRender(<DownloadButton data={data} filename="file" mimeType={mimeType} />);
      fireEvent.click(screen.getByRole("button"));
      const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
      const bytes = await readBytes(blob);
      return { type: blob.type, bytes, text: new TextDecoder().decode(bytes) };
    };

    it("revokes the object URL after a delay, not synchronously", () => {
      vi.useFakeTimers();
      customRender(<DownloadButton data="Hello, World!" filename="hello.txt" mimeType="text/plain" />);

      fireEvent.click(screen.getByRole("button"));
      expect(createObjectURL).toHaveBeenCalled();
      expect(revokeObjectURL).not.toHaveBeenCalled();

      vi.runAllTimers();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("saves plain text as text/plain by default", async () => {
      expect(await download("Hello, World!")).toMatchObject({ type: "text/plain", text: "Hello, World!" });
    });

    it("saves a base64 data URL as bytes with its own type", async () => {
      const result = await download("data:application/pdf;base64,AAH/");
      expect(result.type).toBe("application/pdf");
      expect(Array.from(result.bytes)).toEqual([0, 1, 255]);
    });

    it("saves a percent-encoded data URL", async () => {
      expect(await download("data:text/csv,a%2Cb%20%E2%82%AC")).toMatchObject({ type: "text/csv", text: "a,b €" });
    });

    it("keeps the commas of the payload", async () => {
      expect(await download("data:text/plain,a,b")).toMatchObject({ type: "text/plain", text: "a,b" });
    });

    it("lets mimeType override the type of the data URL", async () => {
      expect(await download("data:text/plain,hi", "application/x-custom")).toMatchObject({
        type: "application/x-custom",
        text: "hi",
      });
    });

    it("saves an object as indented JSON", async () => {
      expect(await download({ message: "Hello", value: 42 })).toMatchObject({
        type: "application/json",
        text: JSON.stringify({ message: "Hello", value: 42 }, null, 2),
      });
    });

    it("saves an array as indented JSON", async () => {
      expect(await download([1, 2])).toMatchObject({ type: "application/json", text: JSON.stringify([1, 2], null, 2) });
    });

    it("shows an alert and offers nothing when the data URL is invalid", () => {
      const onDownload = vi.fn();
      customRender(<DownloadButton data="data:text/plain;base64,@@@" filename="f" onDownload={onDownload} />);

      fireEvent.click(screen.getByRole("button"));

      expect(screen.getByRole("alert")).toHaveTextContent(/invalid base64/i);
      expect(createObjectURL).not.toHaveBeenCalled();
      expect(onDownload).not.toHaveBeenCalled();
    });

    it("shows an alert when the document is nested too deeply to serialise", () => {
      const data = JSON.parse("[".repeat(6000) + "]".repeat(6000)) as unknown[];
      customRender(<DownloadButton data={data} filename="f" />);

      fireEvent.click(screen.getByRole("button"));

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(createObjectURL).not.toHaveBeenCalled();
    });

    it("clears the alert once a download succeeds", () => {
      const { rerender } = customRender(<DownloadButton data="data:text/plain" filename="f" />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("alert")).toBeInTheDocument();

      rerender(<DownloadButton data="data:text/plain,ok" filename="f" />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
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
