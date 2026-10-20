import { useEffect, useRef } from "react";

/**
 * Hook for detecting clicks outside of a specified element
 * @param handler Function to call when clicking outside
 * @param enabled Whether the click-outside detection is enabled
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true,
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;

      // Don't trigger if clicking within the ref element
      if (ref.current && ref.current.contains(target)) {
        return;
      }

      // Don't trigger on drawer/modal content
      const isDrawerContent = target.closest(
        // Our explicit drawer content marker
        "[data-drawer-content], " +
          // HeadlessUI dialog
          '[role="dialog"], ' +
          // General modal/drawer patterns
          "[data-headlessui-state], .headlessui-portal, [data-portal]",
      );
      if (isDrawerContent) return;

      // Don't trigger on headless UI menu content
      const isMenuContent = target.closest('[role="menu"], [role="menuitem"]');
      if (isMenuContent) return;

      // Allow clicking anywhere else (including navbar, layout elements, etc.)
      handler(event);
    };

    // Use capture phase to ensure we catch all events before they bubble
    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
    };
  }, [handler, enabled]);

  return ref;
};
