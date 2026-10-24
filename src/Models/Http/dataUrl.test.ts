import { describe, expect, it } from "vitest";
import { decodeDataUrl } from "./dataUrl";

const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

describe("decodeDataUrl", () => {
  it("decodes base64 and reports the media type", () => {
    const decoded = decodeDataUrl("data:application/pdf;base64,SGVsbG8=");
    expect(decoded.mimeType).toBe("application/pdf");
    expect(text(decoded.bytes)).toBe("Hello");
  });

  it("decodes base64 with parameters before the flag", () => {
    const decoded = decodeDataUrl("data:text/plain;charset=utf-8;base64,SGVsbG8=");
    expect(decoded.mimeType).toBe("text/plain");
    expect(text(decoded.bytes)).toBe("Hello");
  });

  it("decodes percent-encoding when there is no base64 flag", () => {
    const decoded = decodeDataUrl("data:text/plain,hello%20%E2%82%AC");
    expect(decoded.mimeType).toBe("text/plain");
    expect(text(decoded.bytes)).toBe("hello €");
  });

  it("keeps everything after the first comma", () => {
    expect(text(decodeDataUrl("data:text/plain,a,b,c").bytes)).toBe("a,b,c");
  });

  it("keeps raw non-ASCII text and malformed escapes as is", () => {
    expect(text(decodeDataUrl("data:,€ 100% %zz").bytes)).toBe("€ 100% %zz");
  });

  it("decodes percent-encoded bytes that are not valid UTF-8", () => {
    expect(Array.from(decodeDataUrl("data:application/octet-stream,%00%FF").bytes)).toEqual([0, 255]);
  });

  it("has no media type when the URL omits it", () => {
    expect(decodeDataUrl("data:,hi").mimeType).toBeUndefined();
    expect(decodeDataUrl("data:;base64,aGk=").mimeType).toBeUndefined();
  });

  it("is case-insensitive on the scheme and the base64 flag", () => {
    expect(text(decodeDataUrl("DATA:text/plain;BASE64,aGk=").bytes)).toBe("hi");
  });

  it.each([["data:text/plain"], ["http://example.com/a,b"], ["data:text/plain;base64,@@@"]])("throws on %j", (url) => {
    expect(() => decodeDataUrl(url)).toThrow();
  });
});
