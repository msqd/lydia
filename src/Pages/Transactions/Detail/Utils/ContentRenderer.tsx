import { DocumentIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { CodeFormatter, type CodeLanguage } from "@msqd/lydia/Components/Formatter";
import { type HttpBody, stringifyBody } from "@msqd/lydia/Models/Http/body";
import { contentDispositionFilename } from "@msqd/lydia/Models/Http/contentDisposition";
import { type HttpHeader, findHeader } from "@msqd/lydia/Models/Http/headers";
import type { ContentType } from "@msqd/lydia/Models/Transactions/types";
import { useMemo } from "react";
import { DownloadButton } from "../Components/DownloadButton";

export interface ContentRendererProps {
  /**
   * Content to render
   */
  content: HttpBody | undefined;
  /**
   * Content type
   */
  contentType?: ContentType;
  /**
   * Headers associated with the content, looked up by name rather than displayed.
   */
  headers?: HttpHeader[];
  /**
   * Maximum height for code formatter
   */
  maxHeight?: number;
}

const PDF_DATA_URL = /^data:application\/pdf(;[^,]*)?,/i;

const isPdfMediaType = (contentTypeHeader: string | undefined) =>
  contentTypeHeader?.split(";")[0]?.trim().toLowerCase() === "application/pdf";

// Map content types to supported CodeLanguage types
function getLanguage(type: ContentType | undefined, content: HttpBody): CodeLanguage {
  switch (type) {
    case "json":
      return "json";
    case "xml":
    case "html":
      return "html"; // HTML is the closest to XML
    case "text":
      return "text";
    default:
      return typeof content === "string" ? "text" : "json";
  }
}

/**
 * Utility component that renders different content types appropriately
 * Supports JSON, XML, HTML, text, images, and binary content
 */
export function ContentRenderer({ content, contentType, headers, maxHeight = 384 }: ContentRendererProps) {
  const contentDisposition = findHeader(headers, "Content-Disposition");
  const filename = useMemo(
    () => (contentDisposition === undefined ? undefined : contentDispositionFilename(contentDisposition)) ?? "file.bin",
    [contentDisposition],
  );

  const stringContent = useMemo(() => (content === undefined ? "" : stringifyBody(content)), [content]);

  if (content === undefined || content === "") {
    return <p className="text-sm text-gray-500">Empty body</p>;
  }

  const contentTypeHeader = findHeader(headers, "Content-Type");
  const contentLength = findHeader(headers, "Content-Length");

  switch (contentType) {
    case "image": {
      // Determine if it's a data URL or just a placeholder
      const isDataUrl = typeof content === "string" && content.startsWith("data:image");
      const isPlaceholder = typeof content === "string" && content.includes("[Binary");

      if (isDataUrl) {
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-md p-4">
              <img
                src={content}
                alt="Response image"
                className="max-w-full h-auto mx-auto"
                style={{ maxHeight: "400px" }}
              />
            </div>
            <div className="flex justify-center">
              <DownloadButton data={content} filename="image.png" mimeType={contentTypeHeader || "image/png"} />
            </div>
          </div>
        );
      } else if (isPlaceholder) {
        return (
          <div className="text-center p-8 bg-gray-50 rounded-md space-y-4">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-900 font-medium">{stringContent}</p>
              {contentLength && <p className="text-xs text-gray-500 mt-1">Size: {contentLength} bytes</p>}
            </div>
          </div>
        );
      }

      // Fallback for other image content
      return (
        <div className="text-center p-4 bg-gray-50 rounded-md">
          <span className="text-sm text-gray-500">Image content</span>
        </div>
      );
    }

    case "binary": {
      if (isPdfMediaType(contentTypeHeader) && typeof content === "string" && PDF_DATA_URL.test(content)) {
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-md p-4">
              {/* Chrome refuses PDFs in sandboxed frames, so the frame can only drop the referrer. */}
              <iframe
                src={content}
                title="PDF Preview"
                referrerPolicy="no-referrer"
                className="w-full h-96 border border-gray-300 rounded"
              />
            </div>
            <div className="flex justify-center">
              <DownloadButton data={content} filename={filename} mimeType="application/pdf" />
            </div>
          </div>
        );
      }

      // Generic binary content
      return (
        <div className="text-center p-8 bg-gray-50 rounded-md space-y-4">
          <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <div>
            <p className="text-sm text-gray-900 font-medium">{stringContent}</p>
            {contentLength && <p className="text-xs text-gray-500 mt-1">Size: {contentLength} bytes</p>}
            <p className="text-xs text-gray-500">Filename: {filename}</p>
          </div>
          <div className="flex justify-center">
            <DownloadButton data={content} filename={filename} mimeType={contentTypeHeader} />
          </div>
        </div>
      );
    }

    default:
      return <CodeFormatter language={getLanguage(contentType, content)} code={stringContent} maxHeight={maxHeight} />;
  }
}
