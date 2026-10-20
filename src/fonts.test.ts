import { readFileSync } from "fs";
import { resolve } from "path";
import { brotliDecompressSync } from "zlib";
import { describe, expect, it } from "vitest";

/**
 * The four shipped faces once contained two faces between them: `Lato-Bold.woff2` was a
 * byte-identical copy of Lato Italic, and `Lato-Regular.woff2` was a 43-glyph subset of an
 * italic face. Every file was italic, so the whole interface would have rendered in italic the
 * moment the font token started working.
 *
 * A check that the files exist and have plausible sizes passes on all of that, so this reads the
 * faces themselves: the style bits a browser uses to decide what a file actually is.
 */

/** WOFF2 known-table tags, indexed by the 6-bit tag index in each directory entry. */
const KNOWN_TAGS = [
  "cmap",
  "head",
  "hhea",
  "hmtx",
  "maxp",
  "name",
  "OS/2",
  "post",
  "cvt ",
  "fpgm",
  "glyf",
  "loca",
  "prep",
  "CFF ",
  "VORG",
  "EBDT",
  "EBLC",
  "gasp",
  "hdmx",
  "kern",
  "LTSH",
  "PCLT",
  "VDMX",
  "vhea",
  "vmtx",
  "BASE",
  "GDEF",
  "GPOS",
  "GSUB",
  "EBSC",
  "JSTF",
  "MATH",
  "CBDT",
  "CBLC",
  "COLR",
  "CPAL",
  "SVG ",
  "sbix",
  "acnt",
  "avar",
  "bdat",
  "bloc",
  "bsln",
  "cvar",
  "fdsc",
  "feat",
  "fmtx",
  "fvar",
  "gvar",
  "hsty",
  "just",
  "lcar",
  "mort",
  "morx",
  "opbd",
  "prop",
  "trak",
  "Zapf",
  "Silf",
  "Glat",
  "Gloc",
  "Feat",
  "Sill",
];

function readUIntBase128(buffer: Buffer, start: number): [number, number] {
  let value = 0;
  let position = start;
  for (let i = 0; i < 5; i++) {
    const byte = buffer[position++];
    value = (value << 7) | (byte & 0x7f);
    if ((byte & 0x80) === 0) return [value >>> 0, position];
  }
  throw new Error("malformed UIntBase128");
}

interface Face {
  numGlyphs: number;
  weightClass: number;
  isItalic: boolean;
  isBold: boolean;
  italicAngle: number;
}

/** Reads the style a browser would infer, straight out of the compressed font tables. */
function readFace(path: string): Face {
  const file = readFileSync(path);
  if (file.toString("latin1", 0, 4) !== "wOF2") throw new Error(`${path} is not a WOFF2 file`);

  const numTables = file.readUInt16BE(12);
  const compressedSize = file.readUInt32BE(20);

  let position = 48;
  const directory: { tag: string; length: number }[] = [];
  for (let i = 0; i < numTables; i++) {
    const flags = file[position++];
    const tagIndex = flags & 0x3f;
    const transformVersion = (flags >> 6) & 0x03;

    let tag: string;
    if (tagIndex === 63) {
      tag = file.toString("latin1", position, position + 4);
      position += 4;
    } else {
      tag = KNOWN_TAGS[tagIndex];
    }

    let length: number;
    [length, position] = readUIntBase128(file, position);
    // glyf and loca are transformed by default; every other table is transformed only when asked.
    const transformed = tag === "glyf" || tag === "loca" ? transformVersion === 0 : transformVersion !== 0;
    if (transformed) [length, position] = readUIntBase128(file, position);

    directory.push({ tag, length });
  }

  const tables = brotliDecompressSync(file.subarray(position, position + compressedSize));
  const offsets = new Map<string, number>();
  let offset = 0;
  for (const entry of directory) {
    offsets.set(entry.tag, offset);
    offset += entry.length;
  }

  const maxp = offsets.get("maxp");
  const os2 = offsets.get("OS/2");
  const post = offsets.get("post");
  if (maxp === undefined || os2 === undefined || post === undefined) {
    throw new Error(`${path} is missing the tables that describe its style`);
  }

  const fsSelection = tables.readUInt16BE(os2 + 62);
  return {
    numGlyphs: tables.readUInt16BE(maxp + 4),
    weightClass: tables.readUInt16BE(os2 + 4),
    isItalic: Boolean(fsSelection & 0x01),
    isBold: Boolean(fsSelection & 0x20),
    italicAngle: tables.readInt32BE(post + 4) / 65536,
  };
}

const fontsPath = resolve(__dirname, "../public/fonts");

const expected = [
  { file: "Lato-Regular", weightClass: 400, isItalic: false, isBold: false },
  { file: "Lato-Bold", weightClass: 700, isItalic: false, isBold: true },
  { file: "Lato-Italic", weightClass: 400, isItalic: true, isBold: false },
  { file: "Lato-BoldItalic", weightClass: 700, isItalic: true, isBold: true },
];

describe("bundled fonts", () => {
  it.each(expected)("$file renders the weight and style its name claims", (face) => {
    const actual = readFace(resolve(fontsPath, `${face.file}.woff2`));

    expect(actual.weightClass).toBe(face.weightClass);
    expect(actual.isItalic).toBe(face.isItalic);
    expect(actual.isBold).toBe(face.isBold);
    expect(actual.italicAngle === 0).toBe(!face.isItalic);
  });

  it("ships four distinct faces rather than the same one under four names", () => {
    const digests = expected.map(({ file }) => readFileSync(resolve(fontsPath, `${file}.woff2`)).toString("base64"));

    expect(new Set(digests).size).toBe(4);
  });

  it("carries a usable character set in every face", () => {
    for (const { file } of expected) {
      expect(readFace(resolve(fontsPath, `${file}.woff2`)).numGlyphs).toBeGreaterThan(200);
    }
  });
});
