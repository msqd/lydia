import { useMemo } from "react";
import { refractor } from "refractor/core";
import type { SyntaxTree } from "./SyntaxHighlighter";
import { normalizeLanguage } from "./syntaxTheme";

import css from "refractor/css";
// Import and register languages for refractor
import javascript from "refractor/javascript";
import json from "refractor/json";
import markup from "refractor/markup";
import sql from "refractor/sql";
import typescript from "refractor/typescript";

// Register languages once
refractor.register(javascript);
refractor.register(typescript);
refractor.register(json);
refractor.register(css);
refractor.register(sql);
refractor.register(markup);

export type CodeLanguage = "json" | "javascript" | "typescript" | "html" | "css" | "sql" | "text";

/**
 * Attempts to format JSON content with proper indentation
 */
function tryFormatJson(content: string): string {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
}

/**
 * Formats code content based on language type
 */
function formatContent(content: string, language: CodeLanguage): string {
  if (language === "json") {
    return tryFormatJson(content);
  }
  return content;
}

/**
 * Highlights one line with refractor.
 *
 * Lines are highlighted on their own, so a token spanning lines (a block comment,
 * a template string) is only coloured on the line that opens it. Formatted JSON and
 * markup, the bodies this displays, put each token on one line.
 */
function highlightCode(content: string, language: CodeLanguage): SyntaxTree | null {
  if (language === "text") {
    return null;
  }

  try {
    return refractor.highlight(content, normalizeLanguage(language));
  } catch (error) {
    console.warn(`Failed to highlight code for language "${language}":`, error);
    return null;
  }
}

/**
 * Formats a body, splits it into lines once, and highlights lines on demand.
 *
 * The view highlights only the lines it draws, so the cost follows the window
 * and not the size of the body. Results are cached per line text.
 */
export function useCodeHighlighting(
  content: string,
  language: CodeLanguage,
): { formattedContent: string; lines: string[]; highlightLine: (line: string) => SyntaxTree | null } {
  const formattedContent = useMemo(() => formatContent(content, language), [content, language]);
  const lines = useMemo(() => formattedContent.split("\n"), [formattedContent]);

  const highlightLine = useMemo(() => {
    const cache = new Map<string, SyntaxTree | null>();
    return (line: string) => {
      if (!cache.has(line)) cache.set(line, highlightCode(line, language));
      return cache.get(line) ?? null;
    };
  }, [language]);

  return { formattedContent, lines, highlightLine };
}
