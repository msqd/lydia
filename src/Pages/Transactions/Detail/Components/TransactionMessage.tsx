import { contentPaddingClassName } from "@msqd/lydia/Components/Cards";
import { HeadersDisplay } from "@msqd/lydia/Components/Formatter";
import { Subheading } from "@msqd/lydia/Components/Typography/HeadingLevel";
import { Foldable } from "@msqd/lydia/Components/Utilities/Foldable";
import type { HttpMessage } from "@msqd/lydia/Models/Transactions/types";
import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { ContentRenderer } from "../Utils/ContentRenderer";

export interface TransactionMessageProps extends ComponentProps<"div"> {
  /** Section title, e.g. "Request" or "Response". */
  title: string;
  /** The HTTP message (headers + body) to display. */
  message: HttpMessage;
  /** Default open state for the foldable. */
  defaultOpen?: boolean;
  /** Maximum height for content display. */
  maxContentHeight?: number;
}

/**
 * Displays one HTTP message (request or response) — its headers and body — in a foldable section.
 */
export function TransactionMessage({
  title,
  message,
  defaultOpen = true,
  maxContentHeight = 384,
  className,
  ...props
}: TransactionMessageProps) {
  return (
    <div className={twMerge(contentPaddingClassName, className)} {...props}>
      <Foldable title={title} defaultOpen={defaultOpen}>
        <div className="space-y-4">
          <div>
            <Subheading className="text-sm font-medium text-gray-900 mb-2">Headers</Subheading>
            <div className="max-h-64 overflow-auto">
              <HeadersDisplay headers={message.headers} />
            </div>
          </div>

          {message.body && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Subheading className="text-sm font-medium text-gray-900">Body</Subheading>
                {message.size && <span className="text-xs text-gray-500">{message.size} bytes</span>}
              </div>
              <ContentRenderer
                content={message.body}
                contentType={message.contentType}
                headers={message.headers}
                maxHeight={maxContentHeight}
              />
            </div>
          )}
        </div>
      </Foldable>
    </div>
  );
}
