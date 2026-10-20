import { DocumentIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { CodeFormatter, type CodeLanguage } from "@msqd/lydia/Components/Formatter";
import { type HttpHeader, findHeader } from "@msqd/lydia/Models/Http/headers";
import type { ContentType } from "@msqd/lydia/Models/Transactions/types";
import { DownloadButton } from "../Components/DownloadButton";

export interface ContentRendererProps {
  /**
   * Content to render
   */
  content: any;
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

/**
 * Utility component that renders different content types appropriately
 * Supports JSON, XML, HTML, text, images, and binary content
 */
export function ContentRenderer({ content, contentType, headers, maxHeight = 384 }: ContentRendererProps) {
  if (!content) return null;

  const stringContent = typeof content === "string" ? content : JSON.stringify(content, null, 2);

  // Map content types to supported CodeLanguage types
  const getLanguage = (type?: ContentType): CodeLanguage => {
    switch (type) {
      case "json":
        return "json";
      case "xml":
        return "html"; // Use HTML for XML as it's closest
      case "html":
        return "html";
      case "text":
        return "text";
      default:
        // Try to format as JSON if it's an object, otherwise as text
        return typeof content === "object" ? "json" : "text";
    }
  };

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
              <DownloadButton
                data={content}
                filename="image.png"
                mimeType={findHeader(headers, "Content-Type") || "image/png"}
              />
            </div>
          </div>
        );
      } else if (isPlaceholder) {
        return (
          <div className="text-center p-8 bg-gray-50 rounded-md space-y-4">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-900 font-medium">{content}</p>
              {findHeader(headers, "Content-Length") && (
                <p className="text-xs text-gray-500 mt-1">Size: {findHeader(headers, "Content-Length")} bytes</p>
              )}
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
      // Check if it's PDF by content type header
      const isPdf = findHeader(headers, "Content-Type")?.includes("pdf");
      const filename =
        findHeader(headers, "Content-Disposition")
          ?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)?.[1]
          ?.replace(/['"]/g, "") || "file.bin";

      if (isPdf && typeof content === "string" && content.startsWith("data:application/pdf")) {
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-md p-4">
              <iframe src={content} title="PDF Preview" className="w-full h-96 border border-gray-300 rounded" />
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
            <p className="text-sm text-gray-900 font-medium">{content}</p>
            {findHeader(headers, "Content-Length") && (
              <p className="text-xs text-gray-500 mt-1">Size: {findHeader(headers, "Content-Length")} bytes</p>
            )}
            {filename && <p className="text-xs text-gray-500">Filename: {filename}</p>}
          </div>
          <div className="flex justify-center">
            <DownloadButton
              data={content}
              filename={filename}
              mimeType={findHeader(headers, "Content-Type") || "application/octet-stream"}
            />
          </div>
        </div>
      );
    }

    default:
      return <CodeFormatter language={getLanguage(contentType)} code={stringContent} maxHeight={maxHeight} />;
  }
}
