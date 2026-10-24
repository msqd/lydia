import { percentDecode } from "./percent";

const MAX_FILENAME_LENGTH = 255;
const WHITESPACE = /\s/;

/**
 * Split the parameters of a header value such as `attachment; filename="a.txt"` in one pass.
 * Names are lowercased; the first occurrence of a name wins.
 */
function parseParameters(header: string): Map<string, string> {
  const parameters = new Map<string, string>();
  let i = header.indexOf(";");
  if (i < 0) return parameters;

  while (i < header.length) {
    i++; // skip the ";"
    const nameStart = i;
    while (i < header.length && header[i] !== "=" && header[i] !== ";") i++;
    const name = header.slice(nameStart, i).trim().toLowerCase();
    if (header[i] !== "=") continue;

    i++; // skip the "="
    while (i < header.length && WHITESPACE.test(header[i] as string)) i++;

    let value = "";
    if (header[i] === '"') {
      i++;
      while (i < header.length && header[i] !== '"') {
        if (header[i] === "\\") i++;
        value += header[i] ?? "";
        i++;
      }
      i++; // skip the closing quote
      while (i < header.length && header[i] !== ";") i++;
    } else {
      const valueStart = i;
      while (i < header.length && header[i] !== ";") i++;
      value = header.slice(valueStart, i).trim();
    }

    if (name && !parameters.has(name)) parameters.set(name, value);
  }
  return parameters;
}

/** Decode an RFC 5987 `charset'language'percent-encoded` value, or undefined when it is malformed. */
function decodeExtendedValue(value: string): string | undefined {
  const match = /^([^']*)'[^']*'([\s\S]*)$/.exec(value);
  if (!match) return undefined;
  const charset = (match[1] as string).toLowerCase();
  if (charset !== "utf-8" && charset !== "iso-8859-1") return undefined;
  try {
    return new TextDecoder(charset, { fatal: true }).decode(percentDecode(match[2] as string));
  } catch {
    return undefined;
  }
}

function sanitize(filename: string): string | undefined {
  const kept = Array.from(filename).filter((char) => {
    const code = char.codePointAt(0) as number;
    return code > 0x1f && code !== 0x7f && char !== "/" && char !== "\\";
  });
  return kept.slice(0, MAX_FILENAME_LENGTH).join("").trim() || undefined;
}

/**
 * Filename suggested by a `Content-Disposition` header value, made safe to use as a download name.
 *
 * Prefers `filename*` (RFC 5987) over `filename`. Control characters and path separators are
 * removed and the result is capped at 255 characters. Parsing is linear in the header length.
 */
export function contentDispositionFilename(header: string): string | undefined {
  const parameters = parseParameters(header);
  const extended = decodeExtendedValue(parameters.get("filename*") ?? "");
  return sanitize(extended ?? parameters.get("filename") ?? "");
}
