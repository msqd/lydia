/**
 * Syntax highlighting theme colors for code formatting
 * Based on GitHub's light theme with 12px font size
 */
export const tokenStyles: Record<string, React.CSSProperties> = {
  comment: { color: "#6a737d", fontStyle: "italic" },
  prolog: { color: "#6a737d", fontStyle: "italic" },
  doctype: { color: "#6a737d", fontStyle: "italic" },
  cdata: { color: "#6a737d", fontStyle: "italic" },
  punctuation: { color: "#24292e" },
  property: { color: "#005cc5" },
  tag: { color: "#22863a" },
  boolean: { color: "#005cc5" },
  number: { color: "#005cc5" },
  constant: { color: "#005cc5" },
  symbol: { color: "#005cc5" },
  deleted: { color: "#d73a49" },
  selector: { color: "#22863a" },
  "attr-name": { color: "#6f42c1" },
  string: { color: "#032f62" },
  char: { color: "#032f62" },
  builtin: { color: "#005cc5" },
  inserted: { color: "#22863a" },
  operator: { color: "#d73a49" },
  entity: { color: "#6f42c1" },
  url: { color: "#005cc5" },
  variable: { color: "#e36209" },
  function: { color: "#6f42c1" },
  regex: { color: "#032f62" },
  important: { color: "#d73a49", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  keyword: { color: "#d73a49" },
  "class-name": { color: "#6f42c1" },
  "function-name": { color: "#6f42c1" },
  "attr-value": { color: "#032f62" },
  namespace: { color: "#6f42c1" },
  "function-variable": { color: "#6f42c1" },
  literal: { color: "#005cc5" },
  "template-string": { color: "#032f62" },
  "template-punctuation": { color: "#d73a49" },
};

/**
 * Maps language aliases to their canonical forms for the syntax highlighter
 */
export const languageMap: Record<string, string> = {
  html: "markup",
  xml: "markup",
  js: "javascript",
  ts: "typescript",
  jsx: "javascript",
  tsx: "typescript",
};

/**
 * Normalizes language name for syntax highlighting
 */
export function normalizeLanguage(language: string): string {
  return languageMap[language] || language;
}
