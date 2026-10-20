import type { ComponentProps, FunctionComponent } from "react";
import { twMerge } from "tailwind-merge";

export interface ParagraphProps extends ComponentProps<"p"> {
  /**
   * Additional classes to apply to the paragraph
   */
  className?: string;
}

const baseClassName = "mb-2 text-base text-gray-700";

export const P: FunctionComponent<ParagraphProps> = ({ className, ...props }) => {
  return <p className={twMerge(baseClassName, className)} {...props} />;
};
