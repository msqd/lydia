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
