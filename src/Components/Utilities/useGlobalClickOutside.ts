import { useCallback, useEffect } from "react";

// Global click outside manager
class GlobalClickManager {
  private handlers: Set<(event: Event) => void> = new Set();
  private isListening = false;

  private handleGlobalClick = (event: Event) => {
    // Call all registered handlers
    this.handlers.forEach((handler) => handler(event));
  };

  addHandler(handler: (event: Event) => void) {
    this.handlers.add(handler);
    this.startListening();
  }

  removeHandler(handler: (event: Event) => void) {
    this.handlers.delete(handler);
    if (this.handlers.size === 0) {
      this.stopListening();
    }
  }

  private startListening() {
    if (!this.isListening) {
      document.addEventListener("mousedown", this.handleGlobalClick, true);
      document.addEventListener("touchstart", this.handleGlobalClick, true);
      // Also listen on window to catch events that might not bubble to document
      window.addEventListener("mousedown", this.handleGlobalClick, true);
      window.addEventListener("touchstart", this.handleGlobalClick, true);
      this.isListening = true;
    }
  }

  private stopListening() {
    if (this.isListening) {
      document.removeEventListener("mousedown", this.handleGlobalClick, true);
      document.removeEventListener("touchstart", this.handleGlobalClick, true);
      window.removeEventListener("mousedown", this.handleGlobalClick, true);
      window.removeEventListener("touchstart", this.handleGlobalClick, true);
      this.isListening = false;
    }
  }
}

// Global instance
const globalClickManager = new GlobalClickManager();

/**
 * Hook for detecting clicks anywhere in the application
 * This version listens at both document and window level to catch all clicks
 */
export const useGlobalClickOutside = (
  handler: () => void,
  enabled: boolean = true,
  excludeSelectors: string[] = [],
) => {
  const handleClick = useCallback(
    (event: Event) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;

      // Check if the click should be excluded
      for (const selector of excludeSelectors) {
        if (target.closest(selector)) {
          return;
        }
      }

      // Call the handler
      handler();
    },
    [handler, enabled, excludeSelectors],
  );

  useEffect(() => {
    if (enabled) {
      globalClickManager.addHandler(handleClick);
    }

    return () => {
      globalClickManager.removeHandler(handleClick);
    };
  }, [handleClick, enabled]);
};
