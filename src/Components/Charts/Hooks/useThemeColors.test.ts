import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { restoreThemeTokens, stubThemeTokens } from "../../Utilities/Testing";
import { useThemeColor, useThemeColors } from "./useThemeColors";

const tokens = { danger: "--color-danger-200" } as const;

describe("useThemeColors", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
  });

  const stubToken = (value: string) =>
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: () => value,
    } as unknown as CSSStyleDeclaration);

  it("resolves the colours on the first render, so no fallback is painted", () => {
    stubToken("oklch(100% 0 0)");

    const { result } = renderHook(() => useThemeColors(tokens));

    expect(result.current.danger).toBe("rgb(255, 255, 255)");
  });

  it("keeps the same object while the theme does not change", () => {
    stubToken("oklch(100% 0 0)");

    const { result, rerender } = renderHook(() => useThemeColors(tokens));
    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });

  it.each([
    ["an inline style", () => document.documentElement.style.setProperty("--color-danger-200", "oklch(0% 0 0)")],
    ["a theme attribute", () => document.documentElement.setAttribute("data-theme", "dark")],
    ["a stylesheet", () => document.head.appendChild(document.createElement("style"))],
  ])("follows a theme change made through %s", async (_, change) => {
    stubToken("oklch(100% 0 0)");
    const { result } = renderHook(() => useThemeColors(tokens));

    stubToken("oklch(0% 0 0)");
    act(change);

    await waitFor(() => expect(result.current.danger).toBe("rgb(0, 0, 0)"));
  });

  it("follows a stylesheet link", async () => {
    stubToken("oklch(100% 0 0)");
    const { result } = renderHook(() => useThemeColors(tokens));

    stubToken("oklch(0% 0 0)");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    act(() => {
      document.head.appendChild(link);
    });

    await waitFor(() => expect(result.current.danger).toBe("rgb(0, 0, 0)"));
    link.remove();
  });

  it("follows an edit of a stylesheet's text", async () => {
    const style = document.head.appendChild(document.createElement("style"));
    stubToken("oklch(100% 0 0)");
    const { result } = renderHook(() => useThemeColors(tokens));

    stubToken("oklch(0% 0 0)");
    act(() => {
      style.textContent = ":root { --color-danger-200: black }";
    });

    await waitFor(() => expect(result.current.danger).toBe("rgb(0, 0, 0)"));
    style.remove();
  });

  it.each([
    ["a meta tag", () => document.head.appendChild(document.createElement("meta"))],
    ["a script", () => document.head.appendChild(document.createElement("script"))],
    ["a title edit", () => (document.head.appendChild(document.createElement("title")).textContent = "x")],
  ])("ignores %s added to the head", async (_, change) => {
    stubToken("oklch(100% 0 0)");
    const { result } = renderHook(() => useThemeColors(tokens));
    const first = result.current;

    stubToken("oklch(0% 0 0)");
    act(() => {
      change();
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(result.current).toBe(first);
    document.head.querySelectorAll("meta, script, title").forEach((node) => node.remove());
  });

  it("follows the system colour scheme", async () => {
    const listeners: Array<() => void> = [];
    vi.spyOn(window, "matchMedia").mockImplementation(
      () =>
        ({
          addEventListener: (_: string, listener: () => void) => listeners.push(listener),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    stubToken("oklch(100% 0 0)");
    const { result } = renderHook(() => useThemeColors(tokens));

    stubToken("oklch(0% 0 0)");
    act(() => listeners.forEach((listener) => listener()));

    expect(result.current.danger).toBe("rgb(0, 0, 0)");
  });

  it("stops observing once unmounted", () => {
    stubToken("oklch(100% 0 0)");
    const disconnect = vi.spyOn(MutationObserver.prototype, "disconnect");

    renderHook(() => useThemeColors(tokens)).unmount();

    expect(disconnect).toHaveBeenCalled();
  });
});

describe("useThemeColor", () => {
  afterEach(restoreThemeTokens);

  it("resolves a token", () => {
    stubThemeTokens({ "--color-danger-200": "oklch(100% 0 0)" });

    expect(renderHook(() => useThemeColor("--color-danger-200")).result.current).toBe("rgb(255, 255, 255)");
  });

  it("takes a literal colour as is", () => {
    expect(renderHook(() => useThemeColor("#ff5500")).result.current).toBe("#ff5500");
  });

  it("takes no colour as none", () => {
    expect(renderHook(() => useThemeColor(undefined)).result.current).toBeUndefined();
  });

  it("follows the token when the prop changes", () => {
    stubThemeTokens({ "--a": "#111111", "--b": "#222222" });

    const { result, rerender } = renderHook(({ value }) => useThemeColor(value), { initialProps: { value: "--a" } });
    rerender({ value: "--b" });

    expect(result.current).toBe("#222222");
  });
});
