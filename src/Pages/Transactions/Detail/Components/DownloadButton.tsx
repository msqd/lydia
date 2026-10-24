import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@msqd/lydia/Components/Buttons";
import { type HttpBody, stringifyBody } from "@msqd/lydia/Models/Http/body";
import { decodeDataUrl } from "@msqd/lydia/Models/Http/dataUrl";
import { type ComponentProps, useState } from "react";
import { twMerge } from "tailwind-merge";

/** Delay before the object URL is released, so the browser has started reading the blob. */
const REVOKE_DELAY_MS = 1000;

export interface DownloadButtonProps extends Omit<ComponentProps<typeof Button>, "onClick"> {
  /**
   * Data to be downloaded. A `data:` URL is decoded to its bytes, any other string is saved as text and
   * parsed documents as JSON.
   */
  data: HttpBody;
  /**
   * Filename for the download
   */
  filename: string;
  /**
   * MIME type for the download. Defaults to the data URL's own type, else `text/plain` for text and
   * `application/json` for parsed documents.
   */
  mimeType?: string;
  /**
   * Whether to show the download icon
   */
  showIcon?: boolean;
  /**
   * Custom onClick handler (in addition to download)
   */
  onDownload?: () => void;
}

function toBlob(data: HttpBody, mimeType: string | undefined): Blob {
  if (typeof data !== "string") {
    return new Blob([stringifyBody(data)], { type: mimeType ?? "application/json" });
  }
  if (/^data:/i.test(data)) {
    const decoded = decodeDataUrl(data);
    return new Blob([decoded.bytes], { type: mimeType ?? decoded.mimeType ?? "text/plain" });
  }
  return new Blob([data], { type: mimeType ?? "text/plain" });
}

/**
 * Button component that handles file downloads
 * Supports text, parsed documents and `data:` URLs, base64 or percent-encoded.
 * A failure is shown as text under the button.
 */
export function DownloadButton({
  data,
  filename,
  mimeType,
  showIcon = true,
  onDownload,
  children = "Download",
  variant = "primary",
  size = "sm",
  className,
  ...props
}: DownloadButtonProps) {
  const [error, setError] = useState<string>();

  const handleDownload = () => {
    let blob: Blob;
    try {
      blob = toBlob(data, mimeType);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The download failed");
      return;
    }
    setError(undefined);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);

    onDownload?.();
  };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={handleDownload}
        className={twMerge(showIcon && "flex items-center gap-2", className)}
        {...props}
      >
        {showIcon && <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />}
        {children}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
