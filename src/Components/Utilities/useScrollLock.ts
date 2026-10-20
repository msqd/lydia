import { useEffect } from "react";

/**
 * Lock body scroll while `isOpen` is true (e.g. a modal or drawer with a backdrop), restoring the
 * previous scroll position on close and on unmount. No-op while `active` is false.
 */
export function useScrollLock(isOpen: boolean, active = true) {
  useEffect(() => {
    if (!active) return;

    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isOpen, active]);
}
