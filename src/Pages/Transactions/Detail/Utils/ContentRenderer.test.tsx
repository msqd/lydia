import { customRender, screen } from "@/Components/Utilities/Testing";
import type { HttpHeader } from "@msqd/lydia/Models/Http/headers";
import { describe, expect, it, vi } from "vitest";
import { ContentRenderer } from "./ContentRenderer";

const PDF = "data:application/pdf;base64,JVBERi0=";
const header = (name: string, value: string): HttpHeader => ({ name, value });

describe("ContentRenderer", () => {
  describe("empty body", () => {
    it.each([[""], [undefined]])("renders an explicit text for %j", (content) => {
      const { container } = customRender(<ContentRenderer content={content} contentType="json" />);
      expect(screen.getByText("Empty body")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });

  describe("deeply nested body", () => {
    it("shows a notice instead of throwing", () => {
      const content = JSON.parse("[".repeat(6000) + "]".repeat(6000)) as unknown[];
      customRender(<ContentRenderer content={content} contentType="json" />);
      expect(screen.getByRole("alert")).toHaveTextContent("cannot be displayed");
    });
  });

  describe("code", () => {
    it("renders a JSON document", () => {
      const { container } = customRender(<ContentRenderer content={{ a: 1 }} contentType="json" />);
      expect(container).toMatchSnapshot();
    });

    it("renders text", () => {
      customRender(<ContentRenderer content="hello world" contentType="text" />);
      expect(screen.getByText(/hello world/)).toBeInTheDocument();
    });

    it("serializes a document once, however often it renders", () => {
      const stringify = vi.spyOn(JSON, "stringify");
      const content = { a: 1 };
      const { rerender } = customRender(<ContentRenderer content={content} contentType="json" />);
      const afterMount = stringify.mock.calls.filter(([value]) => value === content).length;

      rerender(<ContentRenderer content={content} contentType="json" maxHeight={200} />);

      expect(stringify.mock.calls.filter(([value]) => value === content)).toHaveLength(afterMount);
      stringify.mockRestore();
    });

    it("renders an array without a content type", () => {
      customRender(<ContentRenderer content={[1, 2]} />);
      expect(screen.getByText(/\[/)).toBeInTheDocument();
    });
  });

  describe("image", () => {
    it("renders a data URL with a download", () => {
      const { container } = customRender(
        <ContentRenderer content="data:image/png;base64,iVBORw0KGgo=" contentType="image" />,
      );
      expect(screen.getByRole("img", { name: "Response image" })).toHaveAttribute(
        "src",
        expect.stringMatching(/^data:/),
      );
      expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it("renders a placeholder with the content length", () => {
      const { container } = customRender(
        <ContentRenderer
          content="[Binary image data]"
          contentType="image"
          headers={[header("content-length", "2048")]}
        />,
      );
      expect(screen.getByText("[Binary image data]")).toBeInTheDocument();
      expect(screen.getByText("Size: 2048 bytes")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it("falls back instead of throwing on an object body", () => {
      const { container } = customRender(<ContentRenderer content={{ not: "an image" }} contentType="image" />);
      expect(screen.getByText("Image content")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });

  describe("binary", () => {
    it("renders the generic view with size, filename and download", () => {
      const { container } = customRender(
        <ContentRenderer
          content="[Binary data]"
          contentType="binary"
          headers={[
            header("Content-Type", "application/octet-stream"),
            header("Content-Length", "10"),
            header("Content-Disposition", 'attachment; filename="data.bin"'),
          ]}
        />,
      );
      expect(screen.getByText("Size: 10 bytes")).toBeInTheDocument();
      expect(screen.getByText("Filename: data.bin")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it("defaults the filename", () => {
      customRender(<ContentRenderer content="[Binary data]" contentType="binary" />);
      expect(screen.getByText("Filename: file.bin")).toBeInTheDocument();
    });

    it("decodes an extended filename", () => {
      customRender(
        <ContentRenderer
          content="[Binary data]"
          contentType="binary"
          headers={[header("Content-Disposition", "attachment; filename*=UTF-8''%E2%82%AC%20rates.html")]}
        />,
      );
      expect(screen.getByText("Filename: € rates.html")).toBeInTheDocument();
    });

    it("renders an object body as JSON text instead of throwing", () => {
      const { container } = customRender(<ContentRenderer content={{ parsed: true }} contentType="binary" />);
      expect(screen.getByText(/"parsed": true/)).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it("renders an array body as JSON text instead of throwing", () => {
      customRender(<ContentRenderer content={[1]} contentType="binary" />);
      expect(screen.getByText(/\[\s*1\s*\]/)).toBeInTheDocument();
    });
  });

  describe("PDF", () => {
    it("previews a PDF data URL in a frame that sends no referrer", () => {
      const { container } = customRender(
        <ContentRenderer content={PDF} contentType="binary" headers={[header("Content-Type", "application/pdf")]} />,
      );
      const frame = screen.getByTitle("PDF Preview");
      expect(frame).toHaveAttribute("src", PDF);
      expect(frame).toHaveAttribute("referrerpolicy", "no-referrer");
      expect(container).toMatchSnapshot();
    });

    it("accepts a media type with parameters and any case", () => {
      customRender(
        <ContentRenderer
          content={PDF}
          contentType="binary"
          headers={[header("Content-Type", "Application/PDF; charset=binary")]}
        />,
      );
      expect(screen.getByTitle("PDF Preview")).toBeInTheDocument();
    });

    it("accepts data URL parameters", () => {
      customRender(
        <ContentRenderer
          content="data:application/pdf;name=a.pdf;base64,JVBERi0="
          contentType="binary"
          headers={[header("Content-Type", "application/pdf")]}
        />,
      );
      expect(screen.getByTitle("PDF Preview")).toBeInTheDocument();
    });

    it.each([
      ["a data URL of a lookalike type", "data:application/pdfx;base64,JVBERi0=", "application/pdf"],
      ["a lookalike Content-Type", PDF, "application/pdfx"],
      ["a lookalike Content-Type suffix", PDF, "text/x-pdf"],
      ["a missing Content-Type", PDF, undefined],
    ])("falls back to the generic view for %s", (_, content, contentTypeHeader) => {
      customRender(
        <ContentRenderer
          content={content}
          contentType="binary"
          headers={contentTypeHeader ? [header("Content-Type", contentTypeHeader)] : []}
        />,
      );
      expect(screen.queryByTitle("PDF Preview")).not.toBeInTheDocument();
      expect(screen.getByText(/Filename:/)).toBeInTheDocument();
    });
  });
});
