import { act, render, renderHook } from "@testing-library/react";
import type React from "react";
import { vi } from "vitest";
import { ToastProvider, useErrorToast, useInfoToast, useSuccessToast, useToast, useWarningToast } from "./ToastContext";

// Use a fixed timestamp for consistent IDs
const mockDateNow = 1234567890;
const originalDateNow = Date.now;

describe("ToastContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Date.now = vi.fn(() => mockDateNow);

    // Mock setTimeout to execute immediately
    vi.spyOn(window, "setTimeout").mockImplementation((handler) => {
      if (typeof handler === "function") handler();
      return 123 as unknown as NodeJS.Timeout;
    });
    vi.spyOn(window, "clearTimeout").mockImplementation(() => {});
  });

  afterEach(() => {
    Date.now = originalDateNow;
    vi.restoreAllMocks();
  });

  it("provides toast context to child components", () => {
    const TestComponent = () => {
      const { toasts } = useToast();
      return <div data-testid="toast-count">{toasts.length}</div>;
    };

    const { getByTestId } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    expect(getByTestId("toast-count").textContent).toBe("0");
  });

  it("throws an error when useToast is used outside of ToastProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const TestComponent = () => {
      useToast();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow("useToast must be used within a ToastProvider");

    consoleError.mockRestore();
  });

  it("adds a toast with addToast", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

    const { result } = renderHook(() => useToast(), { wrapper });

    await act(async () => {
      result.current.addToast({
        type: "success",
        title: "Success toast",
        message: "This is a success message",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("success");
    expect(result.current.toasts[0].title).toBe("Success toast");
    expect(result.current.toasts[0].message).toBe("This is a success message");
    expect(result.current.toasts[0].show).toBe(true);
  });

  it("updates a toast with updateToast", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

    const { result } = renderHook(() => useToast(), { wrapper });

    let toastId: string;

    await act(async () => {
      toastId = result.current.addToast({
        type: "success",
        title: "Original title",
      });
    });

    await act(async () => {
      result.current.updateToast(toastId, {
        title: "Updated title",
        message: "New message added",
      });
    });

    expect(result.current.toasts[0].title).toBe("Updated title");
    expect(result.current.toasts[0].message).toBe("New message added");
    expect(result.current.toasts[0].type).toBe("success"); // Type should remain unchanged
  });

  it("removes a toast with removeToast", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

    const { result } = renderHook(() => useToast(), { wrapper });

    let toastId: string;

    await act(async () => {
      toastId = result.current.addToast({
        type: "success",
        title: "Toast to remove",
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    await act(async () => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("calls onClose callback when removing a toast", async () => {
    const onCloseMock = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

    const { result } = renderHook(() => useToast(), { wrapper });

    let toastId: string;

    await act(async () => {
      toastId = result.current.addToast({
        type: "success",
        title: "Toast with callback",
        onClose: onCloseMock,
      });
    });

    await act(async () => {
      result.current.removeToast(toastId);
    });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("clears all toasts with clearAllToasts", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

    const { result } = renderHook(() => useToast(), { wrapper });

    await act(async () => {
      result.current.addToast({ type: "success", title: "Toast 1" });
    });

    await act(async () => {
      result.current.addToast({ type: "error", title: "Toast 2" });
    });

    await act(async () => {
      result.current.addToast({ type: "warning", title: "Toast 3" });
    });

    expect(result.current.toasts).toHaveLength(3);

    await act(async () => {
      result.current.clearAllToasts();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("respects the maxToasts limit", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastProvider maxToasts={2}>{children}</ToastProvider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });

    await act(async () => {
      result.current.addToast({ type: "success", title: "Toast 1" });
    });

    await act(async () => {
      result.current.addToast({ type: "error", title: "Toast 2" });
    });

    await act(async () => {
      result.current.addToast({ type: "warning", title: "Toast 3" });
    });

    // Since maxToasts is 2, only Toast 2 and Toast 3 should remain
    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].title).toBe("Toast 2");
    expect(result.current.toasts[1].title).toBe("Toast 3");
  });

  it("uses defaultDuration for toasts", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastProvider defaultDuration={10000}>{children}</ToastProvider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });

    await act(async () => {
      result.current.addToast({
        type: "success",
        title: "Toast with default duration",
      });
    });

    expect(result.current.toasts[0].duration).toBe(10000);
  });

  it("allows overriding default duration with toast-specific duration", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastProvider defaultDuration={10000}>{children}</ToastProvider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });

    await act(async () => {
      result.current.addToast({
        type: "success",
        title: "Toast with custom duration",
        duration: 3000,
      });
    });

    expect(result.current.toasts[0].duration).toBe(3000);
  });

  describe("Convenience hooks", () => {
    it("useSuccessToast creates a success toast", async () => {
      // Create a shared provider for both hooks
      const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

      const { result } = renderHook(
        () => ({
          addSuccessToast: useSuccessToast(),
          getToasts: useToast().toasts,
        }),
        { wrapper },
      );

      await act(async () => {
        result.current.addSuccessToast("Success", "Success message");
      });

      expect(result.current.getToasts).toHaveLength(1);
      expect(result.current.getToasts[0].type).toBe("success");
      expect(result.current.getToasts[0].title).toBe("Success");
      expect(result.current.getToasts[0].message).toBe("Success message");
    });

    it("useErrorToast creates an error toast", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

      const { result } = renderHook(
        () => ({
          addErrorToast: useErrorToast(),
          getToasts: useToast().toasts,
        }),
        { wrapper },
      );

      await act(async () => {
        result.current.addErrorToast("Error", "Error message");
      });

      expect(result.current.getToasts[0].type).toBe("error");
    });

    it("useWarningToast creates a warning toast", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

      const { result } = renderHook(
        () => ({
          addWarningToast: useWarningToast(),
          getToasts: useToast().toasts,
        }),
        { wrapper },
      );

      await act(async () => {
        result.current.addWarningToast("Warning", "Warning message");
      });

      expect(result.current.getToasts[0].type).toBe("warning");
    });

    it("useInfoToast creates an info toast", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

      const { result } = renderHook(
        () => ({
          addInfoToast: useInfoToast(),
          getToasts: useToast().toasts,
        }),
        { wrapper },
      );

      await act(async () => {
        result.current.addInfoToast("Info", "Info message");
      });

      expect(result.current.getToasts[0].type).toBe("info");
    });
  });
});
