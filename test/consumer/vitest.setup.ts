import { vi } from "vitest";

// jsdom has no canvas, and zrender paints on the next frame, after the test: without a context it throws
// "Cannot set properties of null (setting 'dpr')". The context ignores drawing, measures text as empty, and
// returns itself from any call so that gradients accept their colour stops.
const context: object = new Proxy(
  {},
  {
    get: (_target, property) => (property === "measureText" ? () => ({ width: 0 }) : () => context),
    set: () => true,
  },
);
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => context as unknown as CanvasRenderingContext2D);
