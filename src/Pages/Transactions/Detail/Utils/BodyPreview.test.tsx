import { customRender, screen } from "@/Components/Utilities/Testing";
import { FORMAT_CAP, PREVIEW_SIZE } from "@msqd/lydia/Components/Formatter/bodyLimits";
import { fireEvent } from "@testing-library/react";
import { refractor } from "refractor/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContentRenderer, isPreviewedBody } from "./ContentRenderer";

const hostile = `<script>alert(1)</script><img src=x onerror="alert(1)">`;
const bigHtml = `${hostile}${"y".repeat(FORMAT_CAP)}`;

describe("body too large to format", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows only the start of the body, as text", () => {
    const highlight = vi.spyOn(refractor, "highlight");
    const { container } = customRender(<ContentRenderer content={bigHtml} contentType="html" />);

    const preview = screen.getByLabelText("Body preview");
    expect(preview.textContent).toBe(bigHtml.slice(0, PREVIEW_SIZE));
    expect(screen.getByRole("status")).toHaveTextContent(/^Showing the first 64 KB of 2 MB\.$/);
    expect(container.querySelector("script, img")).toBeNull();
    expect(highlight).not.toHaveBeenCalled();
  });

  it("offers the whole body as plain text and goes back", () => {
    const highlight = vi.spyOn(refractor, "highlight");
    const { container } = customRender(<ContentRenderer content={bigHtml} contentType="html" />);

    fireEvent.click(screen.getByRole("button", { name: "Show all" }));
    expect(screen.queryByLabelText("Body preview")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Showing all 2 MB as plain text, not reformatted.");
    expect(container.querySelector("script, img")).toBeNull();
    expect(highlight).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Show preview only" }));
    expect(screen.getByLabelText("Body preview")).toBeInTheDocument();
  });

  it("downloads the whole body, not the preview", () => {
    const blobs: BlobPart[][] = [];
    vi.stubGlobal(
      "Blob",
      class {
        constructor(parts: BlobPart[]) {
          blobs.push(parts);
        }
      },
    );
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
    customRender(<ContentRenderer content={bigHtml} contentType="html" />);

    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(blobs[0]).toEqual([bigHtml]);
    vi.unstubAllGlobals();
  });

  it("starts from the preview again for another body", () => {
    const other = `other${"z".repeat(FORMAT_CAP)}`;
    const { rerender } = customRender(<ContentRenderer content={bigHtml} contentType="html" />);
    fireEvent.click(screen.getByRole("button", { name: "Show all" }));

    rerender(<ContentRenderer content={other} contentType="html" />);
    expect(screen.getByLabelText("Body preview")).toBeInTheDocument();
  });

  it("previews an object body whose text is over the cap", () => {
    customRender(<ContentRenderer content={{ data: "x".repeat(FORMAT_CAP) }} contentType="json" />);
    expect(screen.getByLabelText("Body preview")).toBeInTheDocument();
  });

  it("leaves a body at the cap to the code view", () => {
    customRender(<ContentRenderer content={"y".repeat(FORMAT_CAP)} contentType="html" />);
    expect(screen.queryByLabelText("Body preview")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Too large to highlight");
  });

  it.each([
    ["a binary body", "binary"],
    ["an image body", "image"],
  ] as const)("does not preview %s", (_, contentType) => {
    expect(isPreviewedBody("x".repeat(FORMAT_CAP + 1), contentType)).toBe(false);
  });
});
