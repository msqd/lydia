import { percentDecode } from "./percent";

export interface DecodedDataUrl {
  /** Media type declared by the URL, without parameters; undefined when the URL omits it. */
  mimeType: string | undefined;
  bytes: Uint8Array;
}

const SCHEME = /^data:/i;

/**
 * Decode a `data:` URL into its bytes and media type.
 *
 * Only the first comma separates the header from the payload; the payload may contain more.
 * Throws an `Error` on a URL that is not a data URL or whose base64 payload is invalid.
 */
export function decodeDataUrl(url: string): DecodedDataUrl {
  const comma = url.indexOf(",");
  if (!SCHEME.test(url) || comma < 0) {
    throw new Error("Not a valid data URL");
  }

  const [mediaType = "", ...parameters] = url.slice("data:".length, comma).split(";");
  const mimeType = mediaType.includes("/") ? mediaType.trim().toLowerCase() : undefined;
  const payload = url.slice(comma + 1);

  if (parameters.some((parameter) => parameter.trim().toLowerCase() === "base64")) {
    return { mimeType, bytes: decodeBase64(payload) };
  }
  return { mimeType, bytes: percentDecode(payload) };
}

function decodeBase64(payload: string): Uint8Array {
  let binary: string;
  try {
    // Base64 payloads of data URLs may themselves be percent-encoded.
    binary = atob(Array.from(percentDecode(payload), (byte) => String.fromCharCode(byte)).join(""));
  } catch {
    throw new Error("The data URL carries invalid base64");
  }
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
