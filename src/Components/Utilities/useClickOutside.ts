import { type RefObject, useEffect, useRef } from "react";

/** An element (through a ref) or a CSS selector whose clicks do not count as outside. */
export type ClickOutsideIgnore = RefObject<Element | null> | string;

export interface UseClickOutsideOptions {
  /** Called once per mouse down or touch start outside the returned ref and every ignored target. */
  onClickOutside: (event: MouseEvent | TouchEvent) => void;
  /** The document listeners exist only while this is true. */
  enabled?: boolean;
  /**
   * Targets that count as inside, on top of the returned ref. Nothing is ignored by default: a
   * portal the guarded element opens has to be listed.
   */
  ignore?: readonly ClickOutsideIgnore[];
}

const isIgnored = (target: Element, ignored: ClickOutsideIgnore) =>
  typeof ignored === "string" ? target.closest(ignored) !== null : (ignored.current?.contains(target) ?? false);

/**
 * Detects clicks outside an element. Attach the returned ref to the element to guard.
 *
 * The latest `onClickOutside` and `ignore` are read at event time, so passing a new function or
 * array on each render does not re-subscribe.
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>({
  onClickOutside,
  enabled = true,
  ignore = [],
}: UseClickOutsideOptions) => {
  const ref = useRef<T>(null);
  const latest = useRef({ onClickOutside, ignore });
  useEffect(() => {
    latest.current = { onClickOutside, ignore };
  });

  useEffect(() => {
    if (!enabled) return;

    const handle = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (ref.current?.contains(target)) return;
      if (latest.current.ignore.some((ignored) => isIgnored(target, ignored))) return;
      latest.current.onClickOutside(event);
    };

    // Capture phase, so a component that stops propagation cannot hide a click from us.
    document.addEventListener("mousedown", handle, true);
    document.addEventListener("touchstart", handle, true);
    return () => {
      document.removeEventListener("mousedown", handle, true);
      document.removeEventListener("touchstart", handle, true);
    };
  }, [enabled]);

  return ref;
};
