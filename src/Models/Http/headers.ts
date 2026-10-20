/**
 * A single header occurrence, as it crossed the wire.
 *
 * Headers are modelled as an ordered sequence rather than a map because HTTP allows a name to
 * repeat and `set-cookie` routinely does. A map would collapse those repeats and lose the order
 * they arrived in.
 */
export interface HttpHeader {
  name: string;
  value: string;
}

/**
 * Value of the first header matching `name`, compared case-insensitively.
 *
 * Lookup normalises case because HTTP header names are case-insensitive; display does not,
 * because a recording of what crossed the wire should show the spelling that was used.
 */
export function findHeader(headers: HttpHeader[] | undefined, name: string): string | undefined {
  const wanted = name.toLowerCase();
  return headers?.find((header) => header.name.toLowerCase() === wanted)?.value;
}
