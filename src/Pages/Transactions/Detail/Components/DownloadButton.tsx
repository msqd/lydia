import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@msqd/lydia/Components/Buttons";
import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface DownloadButtonProps extends Omit<ComponentProps<typeof Button>, "onClick"> {
  /**
   * Data to be downloaded
   */
  data: any;
  /**
   * Filename for the download
   */
  filename: string;
  /**
   * MIME type for the download
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

/**
 * Button component that handles file downloads
 * Supports various data types including strings, objects, and base64 data
 */
export function DownloadButton({
  data,
  filename,
  mimeType = "application/octet-stream",
  showIcon = true,
  onDownload,
  children = "Download",
  variant = "primary",
  size = "sm",
  className,
  ...props
}: DownloadButtonProps) {
  const handleDownload = () => {
    let blob: Blob;

    if (typeof data === "string") {
      // Handle base64 data URLs
      if (data.startsWith("data:")) {
        const [header, base64] = data.split(",");
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        // Extract MIME type from data URL if not explicitly provided
        const dataUrlMimeType = header.match(/data:([^;]+)/)?.[1];
        blob = new Blob([bytes], { type: mimeType || dataUrlMimeType || "application/octet-stream" });
      } else {
        // Regular string data
        blob = new Blob([data], { type: mimeType });
      }
    } else {
      // Objects and other types - convert to JSON
      blob = new Blob([JSON.stringify(data, null, 2)], { type: mimeType || "application/json" });
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Call custom handler if provided
    onDownload?.();
  };

  return (
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
  );
}
