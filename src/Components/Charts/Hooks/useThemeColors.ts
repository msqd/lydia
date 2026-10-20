import { useMemo, useSyncExternalStore } from "react";
import { type ThemeColors, resolveThemeColor, resolveThemeColors } from "../Utils/ThemeColor";

const listeners = new Set<() => void>();
let version = 0;
let stopWatching: (() => void) | undefined;

const isStylesheet = (node: Node): boolean =>
  node instanceof HTMLStyleElement || (node instanceof HTMLLinkElement && /\bstylesheet\b/i.test(node.rel));

/** Head churn (meta tags, scripts, titles, scroll-lock attributes) is not a theme change: only stylesheets are. */
function touchesStylesheet(records: MutationRecord[]): boolean {
  return records.some(({ target, addedNodes, removedNodes }) =>
    [target, ...addedNodes, ...removedNodes].some(
      (node) =>
        isStylesheet(node) || (node.nodeType === Node.TEXT_NODE && !!node.parentNode && isStylesheet(node.parentNode)),
    ),
  );
}

function notify() {
  version += 1;
  listeners.forEach((listener) => listener());
}

/**
 * A theme changes through the root element (inline style, class, `data-theme`), through a stylesheet added to or
 * edited in the head, or through the system colour scheme. A rule inserted with `CSSStyleSheet.insertRule` raises
 * none of these and goes unseen.
 */
function startWatching(): () => void {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
  const stylesheetObserver = new MutationObserver((records) => {
    if (touchesStylesheet(records)) notify();
  });
  stylesheetObserver.observe(document.head, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["href", "media", "disabled", "rel"],
  });

  const scheme = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  scheme?.addEventListener("change", notify);

  return () => {
    observer.disconnect();
    stylesheetObserver.disconnect();
    scheme?.removeEventListener("change", notify);
  };
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) stopWatching = startWatching();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopWatching?.();
  };
}

const getVersion = () => version;

const useThemeVersion = () => useSyncExternalStore(subscribe, getVersion, getVersion);

/**
 * Theme tokens resolved to colours ECharts accepts, re-resolved whenever the theme changes.
 *
 * Resolved during render rather than in an effect, so the first paint already carries the theme's colours.
 * Pass a stable `tokens` object (a module constant): a new one each render resolves each render.
 */
export function useThemeColors<T extends Record<string, string>>(tokens: T): ThemeColors<T> {
  const themeVersion = useThemeVersion();

  // `themeVersion` is not read: it changes when the theme does, which is when to resolve again.
  return useMemo(() => resolveThemeColors(tokens), [tokens, themeVersion]);
}

/** One colour: a theme token (`--color-danger-200`) is resolved like `useThemeColors`, any other value is kept. */
export function useThemeColor(color: string | undefined): string | undefined {
  const themeVersion = useThemeVersion();

  return useMemo(() => (color?.startsWith("--") ? resolveThemeColor(color) : color), [color, themeVersion]);
}
