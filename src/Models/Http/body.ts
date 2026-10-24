/**
 * A captured HTTP body as the proxy hands it over: raw text, a data URL or placeholder for binary
 * content, or a parsed JSON document.
 */
export type HttpBody = string | Record<string, unknown> | unknown[];

/** Text form of a body: strings as is, parsed documents as indented JSON. */
export function stringifyBody(body: HttpBody): string {
  return typeof body === "string" ? body : JSON.stringify(body, null, 2);
}
