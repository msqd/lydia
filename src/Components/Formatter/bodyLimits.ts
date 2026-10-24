/** Above this many characters a body is shown as plain text: highlighting one long line blocks the main thread. */
export const HIGHLIGHT_CAP = 100 * 1024;

/** Above this many characters a body is not reformatted, and a message view shows a preview instead. */
export const FORMAT_CAP = 2 * 1024 * 1024;

/** Number of characters a preview shows. */
export const PREVIEW_SIZE = 64 * 1024;
