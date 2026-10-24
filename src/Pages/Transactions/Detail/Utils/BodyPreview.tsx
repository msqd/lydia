import { Button } from "@msqd/lydia/Components/Buttons";
import { CodeFormatter } from "@msqd/lydia/Components/Formatter";
import { BodyNotice } from "@msqd/lydia/Components/Formatter/BodyNotice";
import { formatFileSize } from "@msqd/lydia/Components/Formatter/PerformanceMetrics";
import { PREVIEW_SIZE } from "@msqd/lydia/Components/Formatter/bodyLimits";
import { useState } from "react";
import { DownloadButton } from "../Components/DownloadButton";

export interface BodyPreviewProps {
  /** The whole body, too large to be formatted. */
  body: string;
  /** Name the whole body is saved under. */
  filename: string;
  /** MIME type the whole body is saved as. */
  mimeType?: string;
  /** Maximum height of the body in pixels. */
  maxHeight?: number;
}

/**
 * Shows the start of a body too large to format, with the choice of the whole body as plain text
 * or as a download. Only the preview is drawn until the reader asks for more.
 */
export function BodyPreview({ body, filename, mimeType, maxHeight = 384 }: BodyPreviewProps) {
  // Keyed on the body so that showing another large body starts from the preview again.
  const [expandedBody, setExpandedBody] = useState<string>();
  const expanded = expandedBody === body;
  const size = formatFileSize(body.length);

  const actions = (
    <>
      <Button variant="secondary" size="sm" onClick={() => setExpandedBody(expanded ? undefined : body)}>
        {expanded ? "Show preview only" : "Show all"}
      </Button>
      <DownloadButton data={body} filename={filename} mimeType={mimeType} variant="secondary" />
    </>
  );

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <BodyNotice actions={actions}>
        {expanded
          ? `Showing all ${size} as plain text, not reformatted.`
          : `Showing the first ${formatFileSize(PREVIEW_SIZE)} of ${size}.`}
      </BodyNotice>
      {expanded ? (
        <CodeFormatter language="text" code={body} maxHeight={maxHeight} className="rounded-none border-0" />
      ) : (
        <pre
          tabIndex={0}
          aria-label="Body preview"
          className="overflow-auto whitespace-pre-wrap break-all p-3 font-mono text-xs leading-5"
          style={{ maxHeight }}
        >
          {body.slice(0, PREVIEW_SIZE)}
        </pre>
      )}
    </div>
  );
}
