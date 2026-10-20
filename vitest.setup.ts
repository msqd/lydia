import "@testing-library/jest-dom/vitest";

// Polyfill ResizeObserver for HeadlessUI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Set consistent timezone for all tests to prevent CI failures
process.env.TZ = "UTC";

// Suppress act() warnings from HeadlessUI components
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    const message = args[0];
    if (
      (typeof message === "string" &&
        message.includes("An update to") &&
        message.includes("inside a test was not wrapped in act(...)")) ||
      (typeof message === "string" && message.includes("Warning: An update to"))
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Store original implementations
const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
const originalToLocaleDateString = Date.prototype.toLocaleDateString;
const originalToLocaleString = Date.prototype.toLocaleString;
const originalDateTimeFormat = Intl.DateTimeFormat;
const originalNumberToLocaleString = Number.prototype.toLocaleString;
const originalNumberFormat = Intl.NumberFormat;

// Standardize locale for date/time formatting in tests
beforeEach(() => {
  Date.prototype.toLocaleTimeString = function (_locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
    return originalToLocaleTimeString.call(this, "en-US", { hour12: false, ...options });
  };

  Date.prototype.toLocaleDateString = function (_locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
    return originalToLocaleDateString.call(this, "en-US", options);
  };

  Date.prototype.toLocaleString = function (_locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
    return originalToLocaleString.call(this, "en-US", { hour12: false, ...options });
  };

  // @ts-ignore - We're overriding a global constructor
  Intl.DateTimeFormat = function (_locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
    return new originalDateTimeFormat("en-US", { hour12: false, ...options });
  };

  Number.prototype.toLocaleString = function (_locales?: string | string[], options?: Intl.NumberFormatOptions) {
    return originalNumberToLocaleString.call(this, "en-US", options);
  };

  // @ts-ignore - We're overriding a global constructor
  Intl.NumberFormat = function (_locales?: string | string[], options?: Intl.NumberFormatOptions) {
    return new originalNumberFormat("en-US", options);
  };
});

// Restore original implementations after each test
afterEach(() => {
  Date.prototype.toLocaleTimeString = originalToLocaleTimeString;
  Date.prototype.toLocaleDateString = originalToLocaleDateString;
  Date.prototype.toLocaleString = originalToLocaleString;
  // @ts-ignore - Restoring global constructor
  Intl.DateTimeFormat = originalDateTimeFormat;
  Number.prototype.toLocaleString = originalNumberToLocaleString;
  // @ts-ignore - Restoring global constructor
  Intl.NumberFormat = originalNumberFormat;
});

// Make TypeScript happy with our Date prototype modifications
declare global {
  interface Date {
    toLocaleTimeString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
    toLocaleDateString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
    toLocaleString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
  }
}
