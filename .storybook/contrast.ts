/**
 * WCAG contrast, measured in the browser a story renders in.
 *
 * `getComputedStyle` returns Tailwind's colours as `oklch()` verbatim, so each
 * colour is painted to a canvas and read back as sRGB. jsdom has no canvas and
 * computes no colours: this is for play functions only.
 */

function painted(colour: string): number[] {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("no 2d canvas to measure a colour with");
  context.fillStyle = colour;
  context.fillRect(0, 0, 1, 1);
  return [...context.getImageData(0, 0, 1, 1).data];
}

function luminance(colour: string): number {
  const [red, green, blue] = painted(colour);
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

/** The contrast ratio between two CSS colours, from 1 to 21. */
export function contrast(one: string, other: string): number {
  const [light, dark] = [luminance(one), luminance(other)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}
