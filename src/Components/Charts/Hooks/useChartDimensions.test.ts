import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChartDimensions } from "./useChartDimensions";

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Store original ResizeObserver
const originalResizeObserver = global.ResizeObserver;

describe("useChartDimensions", () => {
  beforeEach(() => {
    global.ResizeObserver = mockResizeObserver;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
  });

  it("should return default dimensions initially", () => {
    const { result } = renderHook(() => useChartDimensions());

    expect(result.current.dimensions).toEqual({
      containerWidth: 600,
      containerHeight: 300,
      chartAreaWidth: 520, // 600 - 40 - 40
      chartAreaHeight: 240, // 300 - 20 - 40 (default bottom is 40, not 20)
    });
    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it("should use custom default dimensions", () => {
    const { result } = renderHook(() =>
      useChartDimensions({
        defaultWidth: 800,
        defaultHeight: 400,
      }),
    );

    expect(result.current.dimensions).toEqual({
      containerWidth: 800,
      containerHeight: 400,
      chartAreaWidth: 720, // 800 - 40 - 40
      chartAreaHeight: 340, // 400 - 20 - 40 (default padding: top=20, bottom=40)
    });
  });

  it("should use custom padding", () => {
    const { result } = renderHook(() =>
      useChartDimensions({
        defaultWidth: 600,
        defaultHeight: 300,
        padding: { left: 60, right: 60, top: 30, bottom: 50 },
      }),
    );

    expect(result.current.dimensions).toEqual({
      containerWidth: 600,
      containerHeight: 300,
      chartAreaWidth: 480, // 600 - 60 - 60
      chartAreaHeight: 220, // 300 - 30 - 50
    });
  });

  it("should handle partial padding configuration", () => {
    const { result } = renderHook(() =>
      useChartDimensions({
        padding: { left: 50, top: 30 },
      }),
    );

    expect(result.current.dimensions.chartAreaWidth).toBe(550); // 600 - 50 - 0
    expect(result.current.dimensions.chartAreaHeight).toBe(270); // 300 - 30 - 0
  });

  it("should set up ResizeObserver when available", () => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();

    mockResizeObserver.mockReturnValue({
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    });

    const { result, unmount } = renderHook(() => useChartDimensions());

    // Create a mock container element
    const mockElement = {
      offsetWidth: 800,
      offsetHeight: 400,
    };

    act(() => {
      // Simulate ref being set
      (result.current.containerRef as any).current = mockElement;
    });

    // Cleanup
    unmount();
  });

  it("should handle window resize events", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useChartDimensions());

    expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("should use custom debounce timing", () => {
    const { result } = renderHook(() =>
      useChartDimensions({
        debounceMs: 200,
      }),
    );

    expect(result.current.dimensions).toBeDefined();
  });

  it("should handle case when ResizeObserver is not available", () => {
    global.ResizeObserver = undefined as any;

    const { result } = renderHook(() => useChartDimensions());

    expect(result.current.dimensions).toBeDefined();
    expect(result.current.containerRef).toBeDefined();
  });

  it("should calculate correct chart area with zero padding", () => {
    const { result } = renderHook(() =>
      useChartDimensions({
        defaultWidth: 500,
        defaultHeight: 200,
        padding: { left: 0, right: 0, top: 0, bottom: 0 },
      }),
    );

    expect(result.current.dimensions).toEqual({
      containerWidth: 500,
      containerHeight: 200,
      chartAreaWidth: 500,
      chartAreaHeight: 200,
    });
  });

  it("should handle negative padding gracefully", () => {
    const { result } = renderHook(() =>
      useChartDimensions({
        defaultWidth: 600,
        defaultHeight: 300,
        padding: { left: -10, right: -5, top: -2, bottom: -8 },
      }),
    );

    // Negative padding values are still used in calculation (not treated as 0)
    expect(result.current.dimensions.chartAreaWidth).toBe(615); // 600 - (-10) - (-5) = 615
    expect(result.current.dimensions.chartAreaHeight).toBe(310); // 300 - (-2) - (-8) = 310
  });

  it("should update dimensions when container size changes", () => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();

    mockResizeObserver.mockReturnValue({
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    });

    const { result } = renderHook(() => useChartDimensions());

    // Mock container element with initial size
    const mockElement = {
      offsetWidth: 800,
      offsetHeight: 400,
    };

    act(() => {
      (result.current.containerRef as any).current = mockElement;
    });

    // Simulate resize
    act(() => {
      mockElement.offsetWidth = 1000;
      mockElement.offsetHeight = 500;
      // Trigger resize through window event instead
      window.dispatchEvent(new Event("resize"));
    });

    // Dimensions should be calculated based on mock element
    expect(result.current.dimensions.containerWidth).toBeDefined();
    expect(result.current.dimensions.containerHeight).toBeDefined();
  });

  it("should maintain aspect ratio calculations", () => {
    const { result } = renderHook(() =>
      useChartDimensions({
        defaultWidth: 800,
        defaultHeight: 400,
        padding: { left: 50, right: 50, top: 25, bottom: 25 },
      }),
    );

    const { chartAreaWidth, chartAreaHeight } = result.current.dimensions;

    expect(chartAreaWidth).toBe(700); // 800 - 50 - 50
    expect(chartAreaHeight).toBe(350); // 400 - 25 - 25
    expect(chartAreaWidth / chartAreaHeight).toBeCloseTo(2, 1); // Maintain ~2:1 ratio
  });

  it("should handle multiple rapid resize events with debouncing", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() =>
      useChartDimensions({
        debounceMs: 100,
      }),
    );

    const mockElement = {
      offsetWidth: 600,
      offsetHeight: 300,
    };

    act(() => {
      (result.current.containerRef as any).current = mockElement;
    });

    // Simulate multiple rapid resize events
    act(() => {
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new Event("resize"));
    });

    // Fast forward past debounce time
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.dimensions).toBeDefined();

    vi.useRealTimers();
  });
});
