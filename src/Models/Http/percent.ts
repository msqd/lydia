const PERCENT = 0x25;

function hexValue(byte: number | undefined): number {
  if (byte === undefined) return -1;
  if (byte >= 0x30 && byte <= 0x39) return byte - 0x30;
  const lower = byte | 0x20;
  return lower >= 0x61 && lower <= 0x66 ? lower - 0x61 + 10 : -1;
}

/**
 * Decode `%XX` escapes into bytes. Unlike `decodeURIComponent` it never throws and does not
 * require the decoded bytes to be UTF-8: a malformed escape is kept as is.
 */
export function percentDecode(input: string): Uint8Array {
  const source = new TextEncoder().encode(input);
  const output: number[] = [];
  for (let i = 0; i < source.length; i++) {
    const high = source[i] === PERCENT ? hexValue(source[i + 1]) : -1;
    const low = high >= 0 ? hexValue(source[i + 2]) : -1;
    if (low >= 0) {
      output.push(high * 16 + low);
      i += 2;
    } else {
      output.push(source[i] as number);
    }
  }
  return Uint8Array.from(output);
}
