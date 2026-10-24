import type { ComponentProps, FunctionComponent } from "react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { toEchartsColor } from "../Charts/Utils/ThemeColor";

export interface ColorItemProps extends Omit<ComponentProps<"td">, "onCopy"> {
  name: string;
  bgClass: string;
  onCopy?: (hex: string) => void;
}

const toHexByte = (channel: number): string => channel.toString(16).padStart(2, "0");

const rgbToHex = (r: number, g: number, b: number): string => `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;

const canvasToHex = (color: string): string | undefined => {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return undefined;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return rgbToHex(r, g, b);
};

/** Falls back to the computed value itself when the colour cannot be converted. */
const convertToHex = (color: string): string => {
  const rgb = toEchartsColor(color) ?? color;
  const channels = rgb.startsWith("rgb") ? rgb.match(/\d+/g) : null;
  if (channels && channels.length >= 3) {
    return rgbToHex(Number(channels[0]), Number(channels[1]), Number(channels[2]));
  }
  return canvasToHex(color) ?? color;
};

const ColorCell: FunctionComponent<ColorItemProps> = ({ name, bgClass, onCopy, className, ...moreProps }) => {
  const colorRef = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState<string>("");

  useEffect(() => {
    if (colorRef.current) {
      setHex(convertToHex(window.getComputedStyle(colorRef.current).backgroundColor));
    }
  }, [bgClass]);

  return (
    <td className={twMerge("p-2 text-center border border-gray-200", className)} {...moreProps}>
      {/*
        A button inside the cell rather than the cell made a button, so the
        table keeps its cells. Named by the hex it shows first, then by what it
        copies, so a speech user saying what they see reaches it (WCAG 2.5.3).
      */}
      <button
        type="button"
        onClick={() => onCopy?.(hex)}
        className="flex w-full flex-col items-center gap-1 cursor-pointer transition-all hover:bg-gray-50 rounded"
      >
        <div
          ref={colorRef}
          aria-hidden="true"
          className={twMerge("w-12 h-12 rounded border border-gray-300", bgClass)}
        />
        <span
          data-hex
          className="text-xs text-gray-600"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", monospace' }}
        >
          {hex}
        </span>
        <span className="sr-only">, copy {name}</span>
      </button>
    </td>
  );
};

export interface ColorPalette {
  name: string;
  variants: Array<{
    shade: string;
    bgClass: string;
  }>;
}

export interface ColorsProps extends Omit<ComponentProps<"table">, "onCopy"> {
  palettes?: ColorPalette[];
  /** Called with the swatch's hex when it is clicked; copying and feedback are the consumer's. */
  onCopy?: (hex: string) => void;
}

/**
 * The theme's own ramps, which is what a consumer can retheme. Tailwind's stock palette is
 * documented by Tailwind and is deliberately absent here: showing it alongside would suggest
 * the design system owns colors it does not.
 */
const defaultPalettes: ColorPalette[] = [
  {
    name: "Primary",
    variants: [
      { shade: "900", bgClass: "bg-primary-900" },
      { shade: "800", bgClass: "bg-primary-800" },
      { shade: "700", bgClass: "bg-primary-700" },
      { shade: "600", bgClass: "bg-primary-600" },
      { shade: "500", bgClass: "bg-primary-500" },
      { shade: "400", bgClass: "bg-primary-400" },
      { shade: "300", bgClass: "bg-primary-300" },
      { shade: "200", bgClass: "bg-primary-200" },
      { shade: "100", bgClass: "bg-primary-100" },
      { shade: "50", bgClass: "bg-primary-50" },
    ],
  },
  {
    name: "Success",
    variants: [
      { shade: "900", bgClass: "bg-success-900" },
      { shade: "800", bgClass: "bg-success-800" },
      { shade: "700", bgClass: "bg-success-700" },
      { shade: "600", bgClass: "bg-success-600" },
      { shade: "500", bgClass: "bg-success-500" },
      { shade: "400", bgClass: "bg-success-400" },
      { shade: "300", bgClass: "bg-success-300" },
      { shade: "200", bgClass: "bg-success-200" },
      { shade: "100", bgClass: "bg-success-100" },
      { shade: "50", bgClass: "bg-success-50" },
    ],
  },
  {
    name: "Warning",
    variants: [
      { shade: "900", bgClass: "bg-warning-900" },
      { shade: "800", bgClass: "bg-warning-800" },
      { shade: "700", bgClass: "bg-warning-700" },
      { shade: "600", bgClass: "bg-warning-600" },
      { shade: "500", bgClass: "bg-warning-500" },
      { shade: "400", bgClass: "bg-warning-400" },
      { shade: "300", bgClass: "bg-warning-300" },
      { shade: "200", bgClass: "bg-warning-200" },
      { shade: "100", bgClass: "bg-warning-100" },
      { shade: "50", bgClass: "bg-warning-50" },
    ],
  },
  {
    name: "Danger",
    variants: [
      { shade: "900", bgClass: "bg-danger-900" },
      { shade: "800", bgClass: "bg-danger-800" },
      { shade: "700", bgClass: "bg-danger-700" },
      { shade: "600", bgClass: "bg-danger-600" },
      { shade: "500", bgClass: "bg-danger-500" },
      { shade: "400", bgClass: "bg-danger-400" },
      { shade: "300", bgClass: "bg-danger-300" },
      { shade: "200", bgClass: "bg-danger-200" },
      { shade: "100", bgClass: "bg-danger-100" },
      { shade: "50", bgClass: "bg-danger-50" },
    ],
  },
];

export const Colors: FunctionComponent<ColorsProps> = ({
  palettes = defaultPalettes,
  onCopy,
  className,
  ...moreProps
}) => {
  const shades = palettes[0]?.variants.map((v) => v.shade) || [];

  return (
    <div className="overflow-x-auto">
      <table
        className={twMerge("min-w-full border-collapse bg-white shadow-sm rounded-lg", className)}
        role="table"
        aria-label="Color palette table"
        {...moreProps}
      >
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">Color</th>
            {shades.map((shade) => (
              <th
                key={shade}
                className="px-2 py-2 text-center text-sm font-medium text-gray-700 border border-gray-200"
              >
                {shade}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {palettes.map((palette) => (
            <tr key={palette.name} className="hover:bg-gray-25">
              <td className="px-3 py-2 text-sm font-medium text-gray-900 border border-gray-200 bg-gray-50">
                {palette.name}
              </td>
              {palette.variants.map((variant) => (
                <ColorCell
                  key={variant.bgClass}
                  name={`${palette.name} ${variant.shade}`}
                  bgClass={variant.bgClass}
                  onCopy={onCopy}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
