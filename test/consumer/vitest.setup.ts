// jsdom has no canvas, and zrender paints on the next frame, after the test: without a context it throws
// "Cannot set properties of null (setting 'dpr')". The context ignores drawing, measures text as empty, and
// returns itself from any call so that gradients accept their colour stops. It is defined rather than spied
// on: Vitest restores spies when a test file ends, and a frame can still fire after that.
const context: object = new Proxy(
  {},
  {
    get: (_target, property) => (property === "measureText" ? () => ({ width: 0 }) : () => context),
    set: () => true,
  },
);
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { value: () => context, configurable: true });
