import { useState } from "react";
import type { ComponentProps, FC } from "react";
import { twMerge } from "tailwind-merge";
import "./RangeSliderStyles.css";

export type Mark = number | { value: number; label: string; className?: string };

export interface RangeSliderProps {
  min?: number;
  max?: number;
  defaultValue?: { min?: number; max?: number };
  value?: { min?: number; max?: number };
  step?: number;
  onChange?: (value: { min?: number; max?: number }) => void;
  onPointerUp?: (value: { min?: number; max?: number }) => void;
  thumbSize?: string;
  marks?: Mark[];
  /**
   * What the range bounds, for the names of its two thumbs: "Response time,
   * minimum" and "Response time, maximum". Without it they are "Minimum" and
   * "Maximum", which still tells the two apart.
   */
  label?: string;
  className?: string;
}

interface WrapperProps extends ComponentProps<"div"> {
  thumbSize: string;
}

const Wrapper: FC<WrapperProps> = ({ thumbSize, className, children, ...props }) => (
  <div
    className={twMerge("range-slider relative flex items-center", className)}
    style={{
      height: `calc(${thumbSize} + 1.6rem)`,
    }}
    {...props}
  >
    {children}
  </div>
);

interface InputWrapperProps extends ComponentProps<"div"> {
  thumbSize: string;
}

const InputWrapper: FC<InputWrapperProps> = ({ thumbSize, className, children, ...props }) => (
  <div
    className={twMerge("relative w-full", className)}
    style={{
      height: thumbSize,
    }}
    {...props}
  >
    {children}
  </div>
);

interface ControlWrapperProps extends ComponentProps<"div"> {
  thumbSize: string;
}

const ControlWrapper: FC<ControlWrapperProps> = ({ thumbSize, className, children, ...props }) => (
  <div className={twMerge("w-full absolute", className)} style={{ height: thumbSize }} {...props}>
    {children}
  </div>
);

interface InputProps extends Omit<ComponentProps<"input">, "onChange" | "onPointerUp"> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => void;
}
const Input: FC<InputProps & { thumbSize?: string }> = ({ className, thumbSize = "16px", ...props }) => (
  <input
    className={twMerge("range-slider-input", className)}
    style={{ "--thumb-size": thumbSize } as React.CSSProperties}
    type="range"
    {...props}
  />
);
const Rail: FC<ComponentProps<"div">> = ({ className, children, ...props }) => (
  <div
    className={twMerge("absolute w-full top-1/2 -translate-y-1/2 h-[6px] rounded-[3px] bg-gray-200", className)}
    {...props}
  >
    {children}
  </div>
);

const InnerRail: FC<ComponentProps<"div">> = ({ className, ...props }) => (
  <div className={twMerge("absolute h-full left-0 top-0 bg-primary-200 opacity-50", className)} {...props} />
);

interface ControlProps extends ComponentProps<"div"> {
  thumbSize: string;
  /** Which input drives this thumb, so the stylesheet can show the focus of the matching input. */
  thumb: "min" | "max";
}

const Control: FC<ControlProps> = ({ thumbSize, thumb, className, style, ...props }) => (
  <div
    data-thumb={thumb}
    className={twMerge(
      "absolute rounded-full bg-primary-900 top-1/2 -translate-x-1/2 -translate-y-1/2 ring-1 ring-white cursor-grab",
      "z-[2]",
      className,
    )}
    style={{
      width: thumbSize,
      height: thumbSize,
      transition: "transform 0.15s ease, box-shadow 0.15s ease, ring 0.15s ease",
      ...style,
    }}
    {...props}
  />
);

interface MarkProps extends ComponentProps<"div"> {
  markClassName?: string;
}

const Mark: FC<MarkProps> = ({ markClassName, className, ...props }) => (
  <div
    className={twMerge(
      "bg-gray-200 absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full ring-1 ring-white",
      markClassName,
      className,
    )}
    {...props}
  />
);

const Label: FC<ComponentProps<"div">> = ({ className, children, ...props }) => (
  <div
    className={twMerge(
      "absolute top-full -translate-x-1/2 mt-[8px] text-[10px] font-medium whitespace-nowrap select-none",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

/**
 * Holds the value of an uncontrolled slider.
 *
 * `defaultValue` seeds it once and is ignored afterwards, which is how React's own uncontrolled
 * inputs behave: it is the initial value, not a value to track. Re-seeding from it would discard
 * whatever the user had dragged to, and would do so on every render for the ordinary caller who
 * passes an object literal, since a fresh literal is a new identity each time.
 *
 * @param defaultValue - The initial value, read once on mount.
 * @param boundary - The fallback when no defaultValue is given.
 */
const useUncontrolledValue = (defaultValue: number | undefined, boundary: number) => {
  const [value, setValue] = useState(defaultValue !== undefined ? defaultValue : boundary);

  return [value, setValue] as const;
};

/**
 * RangeSlider component for selecting min and max values within a range
 */
export const RangeSlider: FC<RangeSliderProps & Omit<ComponentProps<"div">, "onPointerUp" | "defaultValue">> = ({
  min = 0,
  max = 10,
  defaultValue = undefined,
  value,
  step = 1,
  onChange,
  onPointerUp,
  thumbSize = "16px",
  marks,
  label,
  className,
  ...moreProps
}) => {
  const [uncontrolledMin, setUncontrolledMin] = useUncontrolledValue(defaultValue?.min, min);
  const [uncontrolledMax, setUncontrolledMax] = useUncontrolledValue(defaultValue?.max, max);

  // Controlled mode reads the prop directly. Mirroring it into state would make the prop and the
  // rendered value disagree for a frame, and needs an effect to keep them together afterwards.
  const clamp = (candidate: number) => Math.min(Math.max(candidate, min), max);
  const minValue = clamp(value?.min ?? uncontrolledMin);
  const maxValue = clamp(value?.max ?? uncontrolledMax);
  const isControlled = value !== undefined;

  const handlePointerUp = (e: React.PointerEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (onPointerUp) {
      onPointerUp({ min: minValue, max: maxValue });
    }
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newMinVal = Math.min(Number(e.target.value), maxValue - step);
    if (!isControlled) {
      setUncontrolledMin(newMinVal);
    }
    if (onChange) {
      onChange({ min: newMinVal, max: maxValue });
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newMaxVal = Math.max(Number(e.target.value), minValue + step);
    if (!isControlled) {
      setUncontrolledMax(newMaxVal);
    }
    if (onChange) {
      onChange({ min: minValue, max: newMaxVal });
    }
  };

  // Ensure min/max values are within bounds and calculate positions correctly
  const minPos = Math.max(0, Math.min(100, ((minValue - min) / (max - min)) * 100));
  const maxPos = Math.max(0, Math.min(100, ((maxValue - min) / (max - min)) * 100));

  return (
    <Wrapper thumbSize={thumbSize} className={className} {...moreProps}>
      <InputWrapper thumbSize={thumbSize}>
        <Input
          aria-label={label ? `${label}, minimum` : "Minimum"}
          value={minValue}
          min={min}
          max={max}
          step={step}
          onChange={handleMinChange}
          onPointerUp={handlePointerUp}
          thumbSize={thumbSize}
        />
        <Input
          aria-label={label ? `${label}, maximum` : "Maximum"}
          value={maxValue}
          min={min}
          max={max}
          step={step}
          onChange={handleMaxChange}
          onPointerUp={handlePointerUp}
          thumbSize={thumbSize}
        />
      </InputWrapper>

      <ControlWrapper thumbSize={thumbSize}>
        <Rail>
          <InnerRail
            style={{
              left: `${minPos}%`,
              width: `${maxPos - minPos}%`,
              transition: "left 0.02s ease-out, width 0.02s ease-out",
            }}
          />
          {marks?.map((mark, index) => {
            const markValue = typeof mark === "number" ? mark : mark.value;
            const markLabel = typeof mark === "number" ? null : mark.label;
            const markClassName = typeof mark === "number" ? undefined : mark.className;

            // Calculate mark position as a percentage
            const markPos = ((markValue - min) / (max - min)) * 100;

            // Check if mark is within the selected range
            const isWithinRange = markValue >= minValue && markValue <= maxValue;

            return (
              <div key={index} style={{ position: "absolute", left: `${markPos}%`, top: "50%" }}>
                <Mark markClassName={markClassName} className={isWithinRange ? "bg-primary-200" : undefined} />
                {markLabel && <Label>{markLabel}</Label>}
              </div>
            );
          })}
        </Rail>
        <Control thumb="min" thumbSize={thumbSize} style={{ left: `${minPos}%`, transition: "left 0.02s ease-out" }} />
        <Control thumb="max" thumbSize={thumbSize} style={{ left: `${maxPos}%`, transition: "left 0.02s ease-out" }} />
      </ControlWrapper>
    </Wrapper>
  );
};
