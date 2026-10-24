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
 * Performs syntax highlighting using refractor
 */
function highlightCode(content: string, language: CodeLanguage): SyntaxTree | null {
  if (language === "text") {
    return null;
  }

  try {
    const normalizedLang = normalizeLanguage(language);
    return refractor.highlight(content, normalizedLang);
  } catch (error) {
    console.warn(`Failed to highlight code for language "${language}":`, error);
    return null;
  }
}

export interface HighlightingOptions {
  /** Whether the result will be drawn at all */
  enabled?: boolean;
  /** Skip highlighting above this many lines, where the result would not be drawn */
  maxLines?: number;
}

/**
 * Custom hook for code highlighting and formatting
 *
 * Highlighting costs seconds on a body of a few megabytes, so it is skipped
 * whenever the caller will not draw the result.
 */
export function useCodeHighlighting(
  content: string,
  language: CodeLanguage,
  { enabled = true, maxLines = Number.POSITIVE_INFINITY }: HighlightingOptions = {},
): { formattedContent: string; highlightedAST: SyntaxTree | null; isHighlighted: boolean } {
  const formattedContent = useMemo(() => {
    return formatContent(content, language);
  }, [content, language]);

  const highlightedAST = useMemo(() => {
    if (!enabled || formattedContent.split("\n").length > maxLines) return null;
    return highlightCode(formattedContent, language);
  }, [formattedContent, language, enabled, maxLines]);

  return {
    formattedContent,
    highlightedAST,
    isHighlighted: highlightedAST !== null,
  };
}
