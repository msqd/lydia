import type { ComponentProps, FunctionComponent } from "react";
import { twMerge } from "tailwind-merge";

export interface TitleProps extends ComponentProps<"h1"> {
  /**
   * Additional classes to apply to the heading
   */
  className?: string;
}

// Base styles shared across all heading levels
const baseStyles = "font-semibold text-gray-900";

// H1 Component
export const H1: FunctionComponent<TitleProps> = ({ className, ...props }) => {
  return <h1 className={twMerge("pb-6 text-2xl", baseStyles, className)} {...props} />;
};

// H2 Component
export const H2: FunctionComponent<TitleProps> = ({ className, ...props }) => {
  return <h2 className={twMerge("pb-4 text-xl", baseStyles, className)} {...props} />;
};

// H3 Component
export const H3: FunctionComponent<TitleProps> = ({ className, ...props }) => {
  return <h3 className={twMerge("pb-4 text-lg", baseStyles, className)} {...props} />;
};

// H4 Component
export const H4: FunctionComponent<TitleProps> = ({ className, ...props }) => {
  return <h4 className={twMerge("pb-4 text-base", baseStyles, className)} {...props} />;
};

// H5 Component with optional padding
export interface H5Props extends TitleProps {
  /**
   * Optional padding override
   */
  padding?: string;
  /**
   * Where this heading sits in the document outline, if that is not `h5`.
   *
   * The level and the size are separate questions, and only the consumer can answer the first: a
   * component dropped into a page it does not own cannot know which heading precedes it. Skipping
   * levels is an accessibility failure (WCAG 1.3.1) and being the wrong size is a design failure,
   * so a component that ties the two together forces a choice between them.
   *
   * The size does not move with the level. `<H5 level={3} />` is an `h3` that still looks like an
   * `h5`.
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const H5: FunctionComponent<H5Props> = ({ className, padding, level = 5, ...props }) => {
  const paddingClass = padding || "pb-4";
  const Heading = `h${level}` as const;
  return <Heading className={twMerge(paddingClass, "text-sm", baseStyles, className)} {...props} />;
};

// H6 Component
export const H6: FunctionComponent<TitleProps> = ({ className, ...props }) => {
  return <h6 className={twMerge("pb-4 text-xs", baseStyles, className)} {...props} />;
};
